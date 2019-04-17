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
const tx = wallet.createTransaction('sdfsdfdsfsdfsdfds', 100,blockchain,tp);
const tx2 = wallet.createTransaction('asdsaxzczxc', 200,blockchain,tp);
const tx3 = wallet.createTransaction('sdfsdcvnbvnbvfdsfsdfsdfds', 300,blockchain,tp);
tx.input.amount= 999;
//const tr =Transaction.newTransaction(wallet,'jajklshfdgasljhfgd',99)
//console.log(tr)
//tp.updateOrAddTransaction(tr)
//console.log(tp.transactions.find(t=>t.id === tr.id) === tx)

tp.transactions.forEach(t => {
     Console.log(t)
     
 });