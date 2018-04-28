# [JaecheolCoin](https://github.com/jcgod413/JaecheolCoin)

## What is JaecheolCoin?
----------------
This project is a project that has analyzed and copied Bitcoin's operating principles and implemented directly as Node.js. JaecheolCoin uses peer-to-peer technology to operate with no central authority: managing transactions and issuing money are carried out collectively by the network. 

## How to run
----------------
Make sure you have installated node.js 9.x on your machine.

### 1. Clone this project

### 2. Intall modules
```bash
sudo npm install -g yarn

yarn install
```

### 3. Run the server
```bash
yarn dev
```

## API
----------------
- ### <b>GET</b> /blocks
- ### <b>GET</b> /blocks/:hash
- ### <b>POST</b> /blocks
- ### <b>POST</b> /peers {body: {peer}}
- ### <b>GET</b> /me/balance
- ### <b>GET</b> /me/address
- ### <b>GET</b> /address/:address
- ### <b>GET</b> /transactions
- ### <b>GET</b> /transactions/:id
- ### <b>POST</b> /transactions {body: {address, amount}}


## Contributing
----------------
Contributions are welcome! Please feel free to submit a Pull Request.