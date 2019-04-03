const Transaction = require('../wallet/transaction')

class Miner {
    constructor(blockchaim, transactionPool, wallet, p2pServer) {
        this.blockchaim = blockchaim;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }

    mine() {
        const validTransactions = this.transactionPool.validTransactions()
        validTransactions.push(Transaction.rewardTransaction(this.wallet, wallet.blockchainWallet()))
        const block = this.blockchaim.addBlock(validTransactions);
        this.p2pServer.syncChains()
        this.transactionPool.clear()
        this.broadcastClearTrasnsactions()
        return block
    }
}
module.exports = Miner;