/* eslint-disable no-console */
/* eslint-disable no-undef */
const express = require('express');
const Blockchain = require('../../src/blockChains/blockchain');
const P2pServer = require('../../src/P2P/p2pServer');
const TransactionPool = require('../../src/wallet/transaction-pool');
const Wallet = require('../../src/wallet/index');
const Miner = require('../../src/app/miner');
const paypal = require('paypal-rest-sdk');
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const blockChain = new Blockchain();
const p2pServer = new P2pServer(blockChain, transactionPool);
const miner = new Miner(blockChain, transactionPool, wallet, p2pServer);
const router = express.Router();

p2pServer.listen();

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ASPRF5TMQkha2S1OVQljifwYAfUF34N5Qxk4CsNiR7j1x8LR9UNl5xPHww0fnAhkzX91rexK62ovNvHj',
    'client_secret': 'ELA7qG1jwsUCuHNBjFRPv9YY4Ad6S55XW2QisqJwSjrdbbTc3ZnDw4PYiSelv1kDbGgdUF1-jhwm4LxO'
});
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

router.post('/peers', async (req, res) => {
    p2pServer.addPeer(req.body.server, req.body.peerId)
    p2pServer.syncChains()
    res.render('index')
});

router.post('/mine', async (req, res) => {
    await miner.mine();
    res.redirect('blockchain')
});

router.get('/mine', (req, res) => {
    res.render('mine', { publicKey: wallet.publicKey })
});

router.get('/transaction', (req, res) => {
    const transactions = transactionPool.getTransactions()
    res.render('transaction', { tx: transactions })
});

router.get('/wallet', (req, res) => {
    const balance = wallet.calculateBalance(blockChain);
    const extracto = blockChain.getAllTransactionsForWallet(wallet.publicKey).filter(datas => datas.from != datas.to);
    res.render('wallet', { publicKey: wallet.publicKey, balance: balance, privateKey: wallet.keyPair.getPrivate("hex"), extracto: extracto })
});

router.post('/send', async (req, res) => {
    const { recipient, amount, privateKey } = req.body;
    if (wallet.verifyWalletKeys(privateKey)) {
        const transaction = await wallet.createTransaction(recipient, parseFloat(amount), blockChain, transactionPool);
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

router.post('/validateBlock', async (req, res) => {
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
                let bCom = await block.validateHash(index, timestamp, lastHash, block.data, nonce, difficulty);
                res.render('comparator', { bMin: block.hash, bGen: bCom })
            } else {
                let bCom = await block.validateHash(index, timestamp, lastHash, data, nonce, difficulty);
                res.render('comparator', { bErr: block.hash, bGen: bCom })
            }
        } else {
            let bCom = await block.validateHash(index, timestamp, lastHash, data, nonce, difficulty);
            res.render('comparator', { bErr: block.hash, bGen: bCom })
        }
    } else {
        res.render('comparator', { nGen: "bCom" })
    }
});

router.post('/viewTransactions', async (req, res) => {
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

router.post('/riteFile', async (req, res) => {
    var fs = require('fs');
    let { publicKey, privateKey } = req.body
    fs.writeFile("Keys.txt", `Llaves de la wallet\n \nLlave Pública: ${publicKey}\n\nLlave Privada: ${privateKey}`, function (err) {
        if (err) {
            return console.log(err);
        }
    });
    res.redirect('/wallet')
});

router.post('/pay', (req, res) => {
    let { valor } = req.body
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:4000/success/?total=" + valor,
            "cancel_url": "http://localhost:4000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "cryptocoin",
                    "sku": "001",
                    "price": valor,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": valor
            },
            "description": "compra de token para criptocoin"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });

});

router.get('/success', async (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    let amount = req.query.total

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": amount
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            if (payment.state == 'approved') {
                const transaction = await Wallet.blockchainWallet().createTransaction(wallet.publicKey, parseFloat(amount), blockChain, transactionPool);
                p2pServer.broadcastTransaction(transaction)
                res.redirect('/wallet')
            } else {
                console.log('payment not successful');
                res.redirect('/wallet')
            }
        }
    });
});

router.get('/cancel', (req, res) => res.redirect('/wallet'));

module.exports = router;