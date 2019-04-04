const express = require('express');
const Blockchain = require('../blockChains/blockchain');
const P2pServer = require('../P2P/p2pServer');
const bodyParser = require('body-parser');
//const HTTP_PORT = process.env.HTTP_PORT || 3000 + Math.floor(Math.random() * 10);
const HTTP_PORT = process.env.HTTP_PORT || 3000;
const TransactionPool = require('../wallet/transaction-pool')
const Wallet = require('../wallet/index');
const app = express();

const wallet = new Wallet();
const tp = new TransactionPool();

const bc = new Blockchain();
const p2pServer = new P2pServer(bc, tp);
app.use(bodyParser.json());
p2pServer.listen();
app.get('/block', (req, res) => {
    res.json(bc.chain);
});

app.post('/mine', (req, res) => {
    const block = bc.addBlock(req.body.data);
    console.log("se agrego el nuevo bloque:" );
    p2pServer.syncChains();
    res.redirect('/block')

})

app.get('/transactions', (req, res) => {
    res.json(tp.transactions)
})

app.get('/public-key', (req, res) => {
    res.json({publicKey: wallet.publicKey})
})

app.post('/transact', (req, res) => {
    const { recipient, amount } = req.body;
    const transaction = wallet.crerateTransaction(recipient, amount, tp);
    p2pServer.broadcastTrasnsaction(transaction)
    res.redirect('/transactions')
})


app.listen(HTTP_PORT, () => {
    console.log('HTTP servet listening :' + HTTP_PORT)
});

