const Blockchain = require('../blockChains/blockchain');
const TransactionPool = require('../wallet/transaction-pool');
const p2pServer = require('../P2P/p2pServer')
const wallet = require('../wallet/index');
const Miner = require('./miner');


const tp = new TransactionPool();
const bc = new Blockchain();
const p2p = new p2pServer(bc, tp);
const wall = new wallet();
const wall2 = new wallet();


const tx = wall.createTransaction(wall2, 100, tp);
const tx2 = wall2.createTransaction(wall, 200,tp);
const tx3 = wall.createTransaction(wall2, 300,tp);
tp.updateOrAddTransaction(tx3)
tp.updateOrAddTransaction(tx2)
tp.updateOrAddTransaction(tx)
//
//tp.transactions.forEach(t => {
//     console.log(t)    
// });
//

//for (let i = 0; i < 10; i++) {
//    console.log(bc.addBlock(i))
//
//}
const mine = new Miner(bc, tp, wall, p2p);
for (let i = 0; i < 2; i++) {
    const valor = mine.mine();
    console.log(JSON.stringify(valor));
    console.log('---------------------------');
}