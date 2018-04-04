class Block {
  constructor(index, hash, previousHash, timestamp, data) {
    this.index = index;
    this.hash = hash;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
  }
}

const genesisBlock = new Block(
  0,
  "399DE39BFEA6784E4BDE5FF097D085A21BB4EA5148575051D988B6B74D68B082",
  null,
  new Date().getTime(),
  "This is the genesis block!"
);

let blockchain = [genesisBlock];

console.log(blockchain);