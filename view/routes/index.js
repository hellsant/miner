/* eslint-disable no-console */
/* eslint-disable no-undef */
const express = require('express');
const Blockchain = require('../../src/blockChains/blockchain');
const P2pServer = require('../../src/P2P/p2pServer');
const TransactionPool = require('../../src/wallet/transaction-pool');
const Wallet = require('../../src/wallet/index');
const Miner = require('../../src/app/miner');

const wallet = new Wallet();
const transactionPool = new TransactionPool();
const blockChain = new Blockchain();
const p2pServer = new P2pServer(blockChain, transactionPool);
const miner = new Miner(blockChain, transactionPool, wallet, p2pServer);
const router = express.Router();


router.get('/', (req, res) => {
    res.render('index')
});

router.get('/blockchain', (req, res) => {
    const blocks = blockChain.getChain();
    res.render('blockchain', { blocks: blocks })
});

router.get('/peers', (req, res) => {
    res.render('peers', { port: p2pServer.getP2Pport })
});

router.post('/peers', (req, res) => {
    p2pServer.addPeer(req.body.server, req.body.peerId)
    res.render('index')
});

router.get('/block', (req, res) => {
    res.json(blockChain.getChain());
});

router.post('/addBlock', (req, res) => {
    blockChain.addBlock(req.body.data);
    p2pServer.syncChains();
    res.redirect('/')
});

router.get('/addBlock', (req, res) => {
    res.render('addBlock')
});
router.post('/mine', (req, res) => {
    miner.mine();
    res.redirect('/')
});

router.get('/mine', (req, res) => {
    res.render('mine', { publicKey: wallet.publicKey })
});

router.get('/p2pPort', (req, res) => {
    res.json(p2pServer.getP2Pport())
});

router.get('/transaction', (req, res) => {
    const tx = transactionPool.transactions
    res.render('transaction', { tx: tx })
})
router.get('/wallet', (req, res) => {
    const tx = transactionPool.existingTransaction(wallet.publicKey)
    res.render('wallet', { tx: tx })
});

router.get('/public-key', (req, res) => {
    res.json({ publicKey: wallet.publicKey })
});

router.post('/send', (req, res) => {
    const { recipient, amount } = req.body;
    const transaction = wallet.createTransaction(recipient, amount, blockChain, transactionPool);
    p2pServer.broadcastTrasnsaction(transaction)
    res.redirect('/')
});

router.get('/send', (req, res) => {
    res.render('sendTransaction', { publicKey: wallet.publicKey })
});

router.get('/addPeer/:port', (req, res) => {
    p2pServer.addPeer(req.hostname, req.params.port)
    res.redirect('back')
});
module.exports = router;