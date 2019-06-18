/* eslint-disable no-undef */
const Transaction = require('../wallet/transaction')
const Wallet = require('../wallet/index')

class Miner {
    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }
    /**
     * Mine the block adding the corresponding transactions,
     * synchronize all the blochchains of the other nodes in the network.
     */
    mine() {
        const validTransactions = this.transactionPool.validTransactions();
        validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()));
        const block = this.blockchain.addBlock(validTransactions);
        this.p2pServer.syncChains();
        this.transactionPool.clear();
        this.p2pServer.broadcastClearTransactions();
        return block;
    }
}
module.exports = Miner;