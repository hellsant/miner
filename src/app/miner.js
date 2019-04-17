/* eslint-disable no-undef */
const Transaction = require('../wallet/transaction')
const Wallet = require('../wallet/index')

class Miner {
    constructor(blockChain, transactionPool, wallet, p2pServer) {
        this.blockChain = blockChain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }

    mine() {
        const validTransactions = this.transactionPool.validTransactions()
        validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()))
        const block = this.blockChain.addBlock(validTransactions);
        this.p2pServer.syncChains()
        this.transactionPool.clear()
        this.p2pServer.broadcastClearTrasnsactions()
        return block
    }
}
module.exports = Miner;