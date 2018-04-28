# [JaecheolCoin](https://github.com/jcgod413/JaecheolCoin)


## What is JaecheolCoin?
This project is a project that has analyzed and copied Bitcoin's operating principles and implemented directly as Node.js. JaecheolCoin uses peer-to-peer technology to operate with no central authority: managing transactions and issuing money are carried out collectively by the network. 


## How to run
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
- ### GET /blocks
- ### GET /blocks/:hash
- ### POST /blocks
- ### POST /peers {body: {peer}}
- ### GET /me/balance
- ### GET /me/address
- ### GET /address/:address
- ### GET /transactions
- ### GET /transactions/:id
- ### POST /transactions {body: {address, amount}}


## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.