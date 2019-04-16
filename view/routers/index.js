const express = require('express');
const Blockchain = require('../../src/blockChains/blockchain');
const P2pServer = require('../../src/P2P/p2pServer');
const TransactionPool = require('../../src/wallet/transaction-pool')
const Wallet = require('../../src/wallet/index');
const Miner = require('../../src/app/miner');

const wallet = new Wallet();
const transactionPool = new TransactionPool();
const blockChain = new Blockchain();
const p2pServer = new P2pServer(blockChain, transactionPool);
const miner = new Miner(blockChain, transactionPool, wallet, p2pServer);
const router = express.Router();


router.get('/', (req, res) => {
    res.render('index.html')
});

router.get('/peers', (req, res) => {
    res.render('peers.html')
});

router.post('/peers', (req, res) => {
    p2pServer.addPeer(req.body.server, req.body.peerId)
    res.render('index.html')
});

router.get('/block', (req, res) => {
    res.json(blockChain.getChain());
});

router.post('/addBlock', (req, res) => {
    blockChain.addBlock(req.body.data);
    p2pServer.syncChains();
    res.redirect('/')
})

router.get('/addBlock', (req, res) => {
    res.render('addBlock.html')
})
router.post('/mine', (req, res) => {
    miner.mine();
    console.log(blockChain.getChain())
    res.redirect('/')
})

router.get('/mine', (req, res) => {
    res.render('mine.html')
})


router.get('/p2pPort',(req , res)=>{
    res.json(p2pServer.getP2Pport())
})

router.get('/transactions', (req, res) => {
    res.json(transactionPool.transactions)
})

router.get('/public-key', (req, res) => {
    res.json({ publicKey: wallet.publicKey })
})

router.post('/send', (req, res) => {
    const { recipient, amount } = req.body;
    const transaction = wallet.createTransaction(recipient, amount, transactionPool);
    p2pServer.broadcastTrasnsaction(transaction)
    res.redirect('/')
})

router.get('/send', (req, res) => {
   res.render('sendTransaction.html')
})

router.get('/addPeer/:port', (req, res) => {
    
    p2pServer.addPeer(req.hostname, req.params.port)
    res.redirect('back')
    //res.redirect('/block')
})

module.exports = router;