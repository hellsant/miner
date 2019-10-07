/* eslint-disable no-console */
/* eslint-disable no-undef */
const express = require('express');
const morgan = require('morgan')
const bodyParser = require('body-parser');
//const HTTP_PORT = process.env.HTTP_PORT || 3000 + Math.floor(Math.random() * 10);
const HTTP_PORT = process.env.HTTP_PORT || 3001;
const Blockchain = require('../blockChains/blockchain');
const P2pServer = require('../P2P/p2pServer');
const TransactionPool = require('../wallet/transaction-pool')
const Wallet = require('../wallet/index');
const Miner = require('./miner');

const app = express();
const blockChain = new Blockchain();
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const p2pServer = new P2pServer(blockChain, transactionPool);
const miner = new Miner(blockChain, transactionPool, wallet, p2pServer);
app.use(bodyParser.json());
app.use(morgan('dev'));

app.get('/block', (req, res) => {
    res.json(blockChain.getChain());
});

app.post('/mine', (req, res) => {
    blockChain.addBlock(req.body.data);
    p2pServer.syncChains();
    res.redirect('/block')
})

app.get('/p2pPort', (req, res) => {
    res.json(p2pServer.getP2Pport())
})

app.get('/transactions', (req, res) => {
    res.json(transactionPool.getTransactions())
})

app.get('/public-key', (req, res) => {
    res.json({ publicKey: wallet.publicKey })
})

app.post('/transact', (req, res) => {
    const { recipient, amount } = req.body;
    const transaction = wallet.createTransaction(recipient, parseFloat(amount), blockChain, transactionPool);
    p2pServer.broadcastTransaction(transaction)
    res.redirect('/transactions')
})

app.get('/mine-transactions', (req, res) => {
    const block = miner.mine();
    console.log(`New block added: ${block.toString()}`);
    res.redirect('/block');
});

app.get('/addPeer/:port', (req, res) => {
    p2pServer.addPeer(req.hostname, req.params.port)
    res.redirect('back')
})
app.get('/wallet', (req, res) => {
    const balance = wallet.calculateBalance(blockChain);
    res.json({"balance":balance ,"public key": wallet.publicKey})
});
app.get('/wallet-balance/:val', (req, res) => {
    const val = blockChain.getAllTransactionsForWallet(req.params.val);
    res.json({val})
});
app.listen(HTTP_PORT, () => {
    console.log('HTTP servet listening:', HTTP_PORT)
});

p2pServer.listen();