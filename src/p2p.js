const WebSockets = require('ws');
const Blockchain = require('./blockchain');

const {
  getNewestBlock,
  isBlockStructureValid,
  addBlockToChain,
  replaceChain,
  getBlockchain,
} = Blockchain;

const sockets = [];

// Message Types
const GET_LATEST = 'GET_LATEST';
const GET_ALL = 'GET_ALL';
const BLOCKCHAIN_RESPONSE = 'BLOCKCHAIN_RESPONSE';

// Message Creators
const getLatest = () => ({
  type: GET_LATEST,
  data: null,
});

const getAll = () => ({
  type: GET_ALL,
  data: null,
});

const blockchainResponse = data => ({
  type: BLOCKCHAIN_RESPONSE,
  data,
});

const getSockets = () => sockets;

const startP2PServer = (server) => {
  const wsServer = new WebSockets.Server({ server });
  wsServer.on('connection', (ws) => {
    initSocketConnection(ws);
  });
  console.log('JaecheolCoin P2P Server running!');
};

const initSocketConnection = (ws) => {
  sockets.push(ws);
  handleSocketMessages(ws);
  handleSocketError(ws);
  sendMessage(ws, getLatest());
};

const connectToPeers = (newPeer) => {
  const ws = new WebSockets(newPeer);
  ws.on('open', () => {
    initSocketConnection(ws);
  });
};

const closeSocketConnection = (ws) => {
  ws.close();
  sockets.splice(sockets.indexOf(ws), 1);
};

const parseData = (data) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    console.log(e);
    return null;
  }
};

const handleSocketMessages = (ws) => {
  ws.on('message', (data) => {
    const message = parseData(data);
    if (message === null) {
      return;
    }
    console.log(message);
    switch (message.type) {
      case GET_LATEST:
        sendMessage(ws, responseLatest());
        break;
      case GET_ALL:
        sendMessage(ws, responseAll());
        break;
      case BLOCKCHAIN_RESPONSE:
        const receivedBlocks = message.data;
        if (receivedBlocks === null) {
          break;
        }
        handleBlockchainResponse(receivedBlocks);
        break;
      default:
        break;
    }
  });
};

const handleBlockchainResponse = (receivedBlocks) => {
  if (receivedBlocks.length === 0) {
    console.log('Received blocks have a length of 0');
    return;
  }
  const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
  if (!isBlockStructureValid(latestBlockReceived)) {
    console.log('The block structure of the block received is not valid');
    return;
  }
  const newestBlock = getNewestBlock();
  if (latestBlockReceived.index > newestBlock.index) {
    if (newestBlock.hash === latestBlockReceived.previousHash) {
      addBlockToChain(latestBlockReceived);
    } else if (receivedBlocks.length === 1) {
      sendMessageToAll(getAll()); // request all blocks to other
    } else {
      replaceChain(receivedBlocks); // change to longest chain
    }
  }
};

const sendMessage = (ws, message) => ws.send(JSON.stringify(message));

const sendMessageToAll = message => sockets.forEach(ws => sendMessage(ws, message));

const responseLatest = () => blockchainResponse([getNewestBlock()]);

const responseAll = () => blockchainResponse(getBlockchain());

const broadcastNewBlock = () => sendMessageToAll(responseLatest());

const handleSocketError = (ws) => {
  ws.on('close', () => closeSocketConnection(ws));
  ws.on('error', () => closeSocketConnection(ws));
};

module.exports = {
  startP2PServer,
  connectToPeers,
  broadcastNewBlock,
};
