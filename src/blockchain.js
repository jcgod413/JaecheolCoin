const CryptoJS = require('crypto-js');
const hexToBinary = require('hex-to-binary');

const BLOCK_GENERATION_INTERVAL = 10;
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;

class Block {
  constructor(index, hash, previousHash, timestamp, data, difficulty, nonce) {
    this.index = index;
    this.hash = hash;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.difficulty = difficulty;
    this.nonce = nonce;
  }
}

const getTimestamp = () => Math.round(new Date().getTime() / 1000);

const genesisBlock = new Block(
  0,
  '399DE39BFEA6784E4BDE5FF097D085A21BB4EA5148575051D988B6B74D68B082',
  null,
  getTimestamp(),
  'This is the genesis block!',
  0,
  0,
);

let blockchain = [genesisBlock];

const getNewestBlock = () => blockchain[blockchain.length - 1];

const getBlockchain = () => blockchain;

const createHash = (index, previousHash, timestamp, data, difficulty, nonce) =>
  CryptoJS.SHA256(
    index + previousHash + timestamp + JSON.stringify(data) + difficulty + nonce,
  ).toString();

const createNewBlock = (data) => {
  const previousBlock = getNewestBlock();
  const newBlockIndex = previousBlock.index + 1;
  const newTimestamp = getTimestamp();
  const difficulty = findDifficulty();
  const newBlock = findBlock(
    newBlockIndex,
    previousBlock.hash,
    newTimestamp,
    data,
    difficulty,
  );
  addBlockToChain(newBlock);
  require('./p2p').broadcastNewBlock();
  return newBlock;
};

const findDifficulty = () => {
  const newestBlock = getNewestBlock();
  if (newestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && newestBlock.index !== 0) {
    return calculateNewDifficulty(newestBlock);
  }
  return newestBlock.difficulty;
};

const calculateNewDifficulty = (newestBlock) => {
  const lastCalculatedBlock = blockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
  const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
  const timeTaken = newestBlock.timestamp - lastCalculatedBlock.timestamp;
  if (timeTaken < timeExpected / 2) {
    return lastCalculatedBlock.difficulty + 1;
  } else if (timeTaken > timeExpected * 2) {
    return lastCalculatedBlock.difficulty - 1;
  }
  return lastCalculatedBlock.difficulty;
};

const findBlock = (index, previousHash, timestamp, data, difficulty) => {
  let nonce = 0;
  while (true) {
    console.log('Current nonce', nonce);
    const hash = createHash(
      index,
      previousHash,
      timestamp,
      data,
      difficulty,
      nonce,
    );
    if (hashMatchesDifficulty(hash, difficulty)) {
      return new Block(
        index,
        hash,
        previousHash,
        timestamp,
        data,
        difficulty,
        nonce,
      );
    }
    nonce += 1;
  }
};

const hashMatchesDifficulty = (hash, difficulty) => {
  const hashInBinary = hexToBinary(hash);
  const requiredZeros = '0'.repeat(difficulty);
  console.log('Trying difficulty:', difficulty, 'with hash', hashInBinary);
  return hashInBinary.startsWith(requiredZeros);
};

const getBlocksHash = block =>
  createHash(
    block.index,
    block.previousHash,
    block.timestamp,
    block.data,
    block.difficulty,
    block.nonce,
  );

const isTimestampValid = (newBlock, oldBlock) => (
  oldBlock.timestamp - 60 < newBlock.timestamp &&
  newBlock.timestamp - 60 < getTimestamp()
);

const isBlockStructureValid = (block) => {
  const result = (
    typeof block.index === 'number' &&
    typeof block.hash === 'string' &&
    typeof block.previousHash === 'string' &&
    typeof block.timestamp === 'number' &&
    typeof block.data === 'string'
  );
  return result;
};

const isBlockValid = (candidateBlock, latestBlock) => {
  if (!isBlockStructureValid(candidateBlock)) {
    console.log('The candidate block structure is not valid');
  } else if (latestBlock.index + 1 !== candidateBlock.index) {
    console.log('The candidate block does not have a valid index');
    return false;
  } else if (latestBlock.hash !== candidateBlock.previousHash) {
    console.log('The previous Hash of the candidate block is not the hash of the latest block');
    return false;
  } else if (getBlocksHash(candidateBlock) !== candidateBlock.hash) {
    console.log('The hash of this block is invalid');
    return false;
  } else if (!isTimestampValid(candidateBlock, latestBlock)) {
    console.log(candidateBlock, latestBlock);
    console.log('The timestamp of this block is dodgy');
    return false;
  }
  return true;
};

const isChainValid = (candidateChain) => {
  const isGenesisValid = block => JSON.stringify(block) === JSON.stringify(genesisBlock);
  if (!isGenesisValid(candidateChain[0])) {
    console.log('The candidates genesisBlock is not the same as out genesisBlock');
    return false;
  }
  for (let i = 1; i < candidateChain.length; i += 1) {
    if (!isBlockValid(candidateChain[i], candidateChain[i - 1])) {
      return false;
    }
  }
  return true;
};

const sumDifficulty = (anyBlockchain) => {
  anyBlockchain
    .map(block => block.difficulty)
    .map(difficulty => Math.pow(2, difficulty))
    .reduce((a, b) => a + b);
};

const replaceChain = (candidateChain) => {
  if (isChainValid(candidateChain)
      && sumDifficulty(candidateChain) > sumDifficulty(getBlockchain())) {
    blockchain = candidateChain;
    return true;
  }
  return false;
};

const addBlockToChain = (candidateBlock) => {
  if (isBlockValid(candidateBlock, getNewestBlock())) {
    getBlockchain().push(candidateBlock);
    return true;
  }
  return false;
};

module.exports = {
  getBlockchain,
  createNewBlock,
  getNewestBlock,
  isBlockStructureValid,
  addBlockToChain,
  replaceChain,
};
