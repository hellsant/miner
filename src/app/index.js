const express = require('express');
const Blockchain = require('../blockChains/blockchain');
const P2pServer = require('../P2P/p2pServer');
const bodyParser = require('body-parser');
const HTTP_PORT = process.env.HTTP_PORT || 3000 + Math.floor(Math.random() * 10);
//const HTTP_PORT = process.env.HTTP_PORT || 3000;
const TransactionPool = require('../wallet/transaction-pool')
const Wallet = require('../wallet/index');


const app = express();
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const blockChain = new Blockchain();
const p2pServer = new P2pServer(blockChain, transactionPool);

app.use(bodyParser.json());


app.get('/block', (req, res) => {
    res.json(blockChain.getChain());
});

app.post('/mine', (req, res) => {
    const block = blockChain.addBlock(req.body.data);
    p2pServer.syncChains();
    console.log(`se agrego el nuevo bloque: ${block}`);
    res.redirect('/block')
})

app.get('/transactions', (req, res) => {
    res.json(transactionPool.transactions)
})

app.get('/public-key', (req, res) => {
    res.json({publicKey: wallet.publicKey})
})

app.post('/transact', (req, res) => {
    const { recipient, amount } = req.body;
    const transaction = wallet.createTransaction(recipient, amount, transactionPool);
    p2pServer.broadcastTrasnsaction(transaction)
    res.redirect('/transactions')
})

app.get('/addPeer/:port', (req, res) => {
    p2pServer.addPeer('localhost', req.params.port)
    res.send()
    //res.redirect('/block')
})

app.listen(HTTP_PORT, () => {
    console.log('HTTP servet listening :' + HTTP_PORT)
});

p2pServer.listen();