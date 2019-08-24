/* eslint-disable no-undef */
const Transaction = require('../wallet/transaction')
const Wallet = require('../wallet/index')

/**
 * This is responsible for carrying out mining.
 * @class Miner
 */
class Miner {

    /**
     * Creates an instance of Miner.
     * @param {Blockchain} blockchain to the blockchain that contains the blocks that have already been mined.
     * @param {TransactionPool} transactionPool the pool of transactions that will be mined
     * @param {Wallet} wallet Wallet of the user who will receive the reward for the mining of the block.
     * @param {p2pServer} p2pServer p2p server where the network blockchain.
     * @memberof Miner
     */
    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }

    /**
     * Mine the block adding the corresponding transactions,
     * synchronize all the blochchains of the other nodes in the network.
     * @returns The block that was mined.
     * @memberof Miner
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

/** 
 * This is responsible for carrying out mining.
 * @exports Miner 
*/
module.exports = Miner;