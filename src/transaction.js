const CryptoJS = require('crypto-js');
const elliptic = require('elliptic');
const utils = require('./utils');

const ec = new elliptic.ec('secp256k1');

const COINBASE_AMOUNT = 50;

class TransactionOutput {
  constructor(address, amount) {
    this.address = address;
    this.amount = amount;
  }
}

class TransactionInput {
  // uTxOutId
  // uTxOutIndex
  // Signature
}

class Transaction {
  // ID
  // txInts[]
  // txOuts[]
}

class UTxOut {
  constructor(uTxOutId, uTxOutIndex, address, amount) {
    this.uTxOutId = uTxOutId;
    this.uTxOutIndex = uTxOutIndex;
    this.address = address;
    this.amount = amount;
  }
}

const uTxOuts = [];

const getTxId = (tx) => {
  const txInContent = tx.txIns
    .map(txIn => txIn.uTxOutId + txIn.txOutIndex)
    .reduce((a, b) => a + b);
  const txOutContent = tx.txOuts
    .map(txOut => txOut.address + txOut.amount)
    .reduce((a, b) => a + b, '');

  return CryptoJS.SHA256(txInContent + txOutContent).toString();
};

const findUTxOut = (txOutId, uTxOutIndex, uTxOutList) =>
  uTxOutList.find(uTxOut => uTxOut.txOutId === txOutId && uTxOut.uTxOutIndex === uTxOutIndex);

const signTxIn = (tx, txInIndex, privateKey, uTxOut) => {
  const txIn = tx.txIns[txInIndex];
  const dataToSign = tx.id;
  const referencedUTxOut = findUTxOut(txIn.txOutId, tx.txOutIndex, uTxOuts);
  if (referencedUTxOut === null) {
    return null;
  }
  const referencedAddress = referencedUTxOut.address;
  if (getPublicKey(privateKey) !== referencedAddress) {
    return false;
  }
  const key = ec.keyFromPrivate(privateKey, 'hex');
  const signature = utils.toHexString(key.sign(dataToSign).toDER());
  return signature;
};

const getPublicKey = privateKey => ec
  .keyFromPrivate(privateKey, 'hex')
  .getPublicKey()
  .encode('hex');

const updateUTxOuts = (newTxs, uTxOutList) => {
  const newUTxOuts = newTxs.map((tx) => {
    tx.txOuts.map((txOut, index) => {
      new UTxOut(tx.id, index, txOut.address, txOut.amount);
    });
  }).reduce((a, b) => a.contact(b), []);

  const spentTxOuts = newTxs
    .map(tx => tx.txIns)
    .reduce((a, b) => a.contact(b), [])
    .map(txIn => new UTxOut(txIn.txOutId, txIn.txOutIndex, '', 0));

  const resultingUTxOuts = uTxOutList
    .filter(uTxO => !findUTxOut(uTxO.txOutId, uTxO.txOutIndex, spentTxOuts))
    .concat(newUTxOuts);

  return resultingUTxOuts;
};

const isTxInStructureValid = (txIn) => {
  if (txIn === null) {
    return false;
  } else if (typeof txIn.signature !== 'string') {
    return false;
  } else if (typeof txIn.txOutId !== 'string') {
    return false;
  } else if (typeof txIn.txOutIndex !== 'number') {
    return false;
  }
  return true;
};

const isAddressValid = (address) => {
  if (address.length !== 130) {
    return false;
  } else if (address.match('^[a-fA-F0-9]+$') === null) {
    return false;
  } else if (!addess.startsWith('04')) {
    return false;
  }
  return true;
};

const isTxOutStructureValid = (txOut) => {
  if (txOut === null) {
    return false;
  } else if (typeof txOut.address !== 'string') {
    return false;
  } else if (!isAddressValid(txOut.address)) {
    return false;
  } else if (typeof txOut.amount !== 'number') {
    return false;
  }
  return true;
};

const isTxStructureValid = (tx) => {
  if (typeof tx.id !== 'string') {
    console.log('Tx ID is not valid');
    return false;
  } else if (!(tx.txIns instanceof Array)) {
    console.log('The txIns are not an array');
    return false;
  } else if (!tx.txIns.map(isTxInStructureValid).reduce((a, b) => a && b, true)) {
    console.log('The structure of one of the txIn is not valid');
    return false;
  } else if (!(tx.txOuts instanceof Array)) {
    console.log('The txOuts are not an array');
    return false;
  } else if (!tx.txOuts.map(isTxOutStructureValid).reduce((a, b) => a && b, true)) {
    console.log('The structure of one of the txOut is not valid');
    return false;
  }
  return true;
};

const validateTxIn = (txIn, tx, uTxOutList) => {
  const wantedTxOut = uTxOutList.find(
    uTxOut => uTxOut.txOutId === txIn.txOutId &&
    uTxOut.txOutIndex === txIn.txOutIndex,
  );
  if (wantedTxOut === null) {
    return false;
  }
  const address = wantedTxOut.address;
  const key = ec.keyFromPublic(address, 'hex');
  return key.verify(tx.id, txIn.signature);
};

const getAmountInTxIn = (txIn, uTxOutList) =>
  findUTxOut(txIn.txOutId, txIn.txOutIndex, uTxOutList).amount;

const validateTx = (tx, uTxOutList) => {
  if (!isTxStructureValid(tx)) {
    return false;
  }
  if (getTxId(tx) !== tx.id) {
    return false;
  }

  const hasValidTxIns = tx.txIns.map(txIn =>
    validateTxIn(txIn, tx, uTxOutList),
  );
  if (!hasValidTxIns) {
    return false;
  }

  const amountInTxIns = tx.txIns
    .map(txIn => getAmountInTxIn(txIn, uTxOutList))
    .reduce((a, b) => a + b, 0);

  const amountInTxOuts = tx.txOuts
    .map(txOut => txOut.amount)
    .reduce((a, b) => a + b, 0);

  if (amountInTxIns !== amountInTxOuts) {
    return false;
  }
  return true;
};

const validateCoinbaseTx = (tx, blockIndex) => {
  if (getTxId(tx) !== tx.id) {
    return false;
  } else if (tx.txIns.length !== 1) { // coinbase transaction shold have one transaction
    return false;
  } else if (tx.txIns[0].txOutIndex !== blockIndex) {
    return false;
  } else if (tx.txOuts.length !== 1) {
    return false;
  } else if (tx.txOuts[0].amount !== COINBASE_AMOUNT) {
    return false;
  }
  return true;
};
