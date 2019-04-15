const { INITIAL_BALANCE } = require('../config/config')
const ChainUtil = require('../keys/chain-utils')
const Transaction = require('./transaction')
/**
 * 
 */
class Wallet {

    /**
     * 
     */
    constructor() {
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtil.getKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    /**
     * 
     */
    toString() {
        return `
        wallet
        publicKey:    ${this.publicKey}
        balance:      ${this.balance}
        `
    }

    /**
     * 
     * @param {dataHash} dataHash 
     */
    sign(dataHash) {
        return this.keyPair.sign(dataHash)
    }

    /**
     * 
     * @param {recipient} recipient 
     * @param {amount} amount 
     * @param {transactionPool} transactionPool 
     */
    createTransaction(recipient, amount, transactionPool) {
        if (amount > this.balance) {
            console.log(`amount exede el valance: ${amount} balance: ${this.balance}`)
            return;
        }
        let transaction = transactionPool.existingTransaction(this.publicKey)
        if (transaction) {
            transaction.update(this, recipient, amount)
        } else {
            transaction = Transaction.newTransaction(this, recipient, amount)
            transactionPool.updateOrAddTransaction(transaction)
        }
        return transaction
    }

    /**
     * 
     */
    static blockchainWallet(){
        const blockchainWallet = new this();
        blockchainWallet.address = 'Coinbase-0000xxx'
        return blockchainWallet
    }
}
module.exports = Wallet;