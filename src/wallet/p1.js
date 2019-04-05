const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
//
const wallet = new Wallet();
const tp = new TransactionPool();
const tx = wallet.createTransaction('sdfsdfdsfsdfsdfds', 100,tp);
const tx2 = wallet.createTransaction('asdsaxzczxc', 200,tp);
const tx3 = wallet.createTransaction('sdfsdcvnbvnbvfdsfsdfsdfds', 300,tp);
tx.input.amount= 999;
//const tr =Transaction.newTransaction(wallet,'jajklshfdgasljhfgd',99)
//console.log(tr)
//tp.updateOrAddTransaction(tr)
//console.log(tp.transactions.find(t=>t.id === tr.id) === tx)

tp.transactions.forEach(t => {
     console.log(t)
     
 });