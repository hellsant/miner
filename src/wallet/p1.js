const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
//
const wallet = new wallet();
const tp = new TransactionPool();
const tx = wallet.createTransaction('sdfsdfdsfsdfsdfds', 100,tp);
const tx2 = wallet.createTransaction('asdsaxzczxc', 200,tp);
const tx3 = wallet.createTransaction('sdfsdcvnbvnbvfdsfsdfsdfds', 300,tp);
 tp.transactions.forEach(t => {
     console.log(t)
     
 });