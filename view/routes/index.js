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

p2pServer.listen();

router.get('/', (req, res) => {
    res.render('index')
});

router.get('/blockchain', (req, res) => {
    const block = blockChain.getChain();
    res.render('blockchain', { blocks: block })
});

router.get('/peers', (req, res) => {
    res.render('peers', { port: p2pServer.getP2Pport })
});

router.post('/peers', (req, res) => {
    p2pServer.addPeer(req.body.server, req.body.peerId)
    p2pServer.syncChains()
    res.render('index')
});

router.post('/mine', (req, res) => {
    miner.mine();
    res.redirect('blockchain')
});

router.get('/mine', (req, res) => {
    res.render('mine', { publicKey: wallet.publicKey })
});

router.get('/transaction', (req, res) => {
    const transactions = transactionPool.transactions
    res.render('transaction', { tx: transactions })
});

router.get('/wallet', (req, res) => {
    const balance = wallet.calculateBalance(blockChain);
    const extracto = blockChain.getAllTransactionsForWallet(wallet.publicKey).filter(datas => datas.from != datas.to);
    res.render('wallet', { publicKey: wallet.publicKey, balance: balance, privateKey: wallet.keyPair.getPrivate("hex"), extracto: extracto })
});

router.post('/send', (req, res) => {
    const { recipient, amount, privateKey } = req.body;
    if (wallet.verifyWalletKeys(privateKey)) {
        const transaction = wallet.createTransaction(recipient, parseFloat(amount), blockChain, transactionPool);
        if (transaction) {
            p2pServer.broadcastTransaction(transaction)
            res.redirect('transaction')
        }
    } else {
        res.render('sendTransaction', { publicKey: wallet.publicKey })
    }
});

router.get('/validateBlock', (req, res) => {
    let block = blockChain.getChain()[blockChain.getChain().length - 1]
    res.render('validateBlock', { index: block.index, timestamp: block.timestamp, lastHash: block.lastHash, data: block.data, nonce: block.nonce, difficulty: block.difficulty })
});

router.post('/validateBlock', (req, res) => {
    const { index, timestamp, lastHash, data, nonce, difficulty } = req.body
    let block = blockChain.getChain()[index]
    var count = 0
    if (block) {
        let str = lastHash + nonce + difficulty + index + timestamp
        if (str === block.toStringComparable()) {
            data.forEach(id => {
                block.data.forEach(tr => {
                    if (tr.id == id) count = count + 1
                });
            });
            if (count == data.length) {
                let bCom = block.validateHash(index, timestamp, lastHash, block.data, nonce, difficulty);
                res.render('comparator', { bMin: block.hash, bGen: bCom })
            } else {
                let bCom = block.validateHash(index, timestamp, lastHash, data, nonce, difficulty);
                res.render('comparator', { bErr: block.hash, bGen: bCom })
            }
        } else {
            let bCom = block.validateHash(index, timestamp, lastHash, data, nonce, difficulty);
            res.render('comparator', { bErr: block.hash, bGen: bCom })
        }
    } else {
        res.render('comparator', { nGen: "bCom" })
    }
});

router.post('/viewTransactions', (req, res) => {
    let { index } = req.body
    let block = blockChain.getChain()[parseInt(index)]
    res.render('viewTransactions', { tx: block.data })
});

router.get('/send', (req, res) => {
    res.render('sendTransaction', { publicKey: wallet.publicKey })
});

router.get('/addPeer/:port', (req, res) => {
    p2pServer.addPeer(req.hostname, req.params.port)
    res.redirect('back')
});

router.post('/riteFile', (req, res) => {
    var fs = require('fs');
    let { publicKey, privateKey } = req.body
    fs.writeFile("Keys.txt", `Llaves de la wallet\n \nLlave Pública: ${publicKey}\n\nLlave Privada: ${privateKey}`, function (err) {
        if (err) {
            return console.log(err);
        }
    });
    res.redirect('/wallet')
});

module.exports = router;