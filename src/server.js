const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const Blockchain = require('./blockchain');
const P2P = require('./p2p');

const { getBlockchain, createNewBlock } = Blockchain;
const { startP2PServer, connectToPeers } = P2P;

const PORT = process.env.HTTP_PORT || 3000;

const app = express();

app.use(bodyParser.json());
app.use(morgan('combined'));

app.get('/blocks', (req, res) => {
  res.send(getBlockchain());
});

app.post('/blocks', (req, res) => {
  const { data } = req.body;
  const newBlock = createNewBlock(data);
  res.send(newBlock);
});

app.post('/peers', (req, res) => {
  const { peer } = req.body;
  connectToPeers(peer);
  res.send();
});

const server = app.listen(PORT, () => console.log('JaecheolCoin Server running on port', PORT));

startP2PServer(server);
