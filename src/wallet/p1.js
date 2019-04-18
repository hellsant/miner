/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');
// eslint-disable-next-line no-unused-vars
const Transaction = require('./transaction');
const Blockchain = require('../blockChains/blockchain')
//
const blockchain = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const tx = wallet.createTransaction('sdfsdfdsfsdfsdfds', 10,blockchain,tp);
const tx2 = wallet.createTransaction('asdsaxzczxc', 20,blockchain,tp);
const tx3 = wallet.createTransaction('sdfsdcvnbvnbvfdsfsdfsdfds', 30,blockchain,tp);
Transaction.singTransaction(tx,'sdfsdfdsfsdfsdfds')
//console.log(Transaction.verifyTransaction(tx))
tx.input.amount= 999;

//const tr =Transaction.newTransaction(wallet,'jajklshfdgasljhfgd',99)
//console.log(tr)
//tp.updateOrAddTransaction(tr)
//console.log(tp.transactions.find(t=>t.id === tr.id) === tx)

tp.transactions.forEach(t => {
     console.log(t)
     
 });