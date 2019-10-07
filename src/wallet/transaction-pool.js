/* eslint-disable no-console */
/* eslint-disable no-undef */
const Transaction = require('./transaction');

/**
 * It creates a pool of transactions which will be handled by the wallet for mined later.
 * @class TransactionPool
 */
class TransactionPool {

    /**
     *Creates an instance of TransactionPool.
     * @memberof TransactionPool
     */
    constructor() {
        this.transactions = [];
    }

    /**
     * Update or add transaction for the blockchain.
     * @param {Transaction} transaction transaction
     * @memberof TransactionPool
     */
    updateOrAddTransaction(transaction) {
        let transactionWithId = this.transactions.find(t => t.id === transaction.id);
        if (transactionWithId) {
           this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
        } else {
            this.transactions.push(transaction);
        }
    }

    /**
     * Returns a existing transaccion.
     * @param {string} address address to send a transaction
     * @returns {boolean} True if a address exist in other case terun false | Boolean
     * @memberof TransactionPool
     */
    existingTransaction(address) {
        return this.transactions.find(t => t.input.address === address);
    }

    /**
     * The verification is done using the signature and the transaction
     * @returns Transaction or send a message acording a error | Transaction
     * @memberof TransactionPool
     */
    validTransactions() {
        return this.transactions.filter(transaction => {
            const outputTotal = transaction.outputs.reduce((total, output) => {
                return total + output.amount;
            }, 0);
            if (transaction.input.amount !== outputTotal) {
                console.log(`Invalid transaction from ${transaction.input.address}.`);
                return;
            }
            if (!Transaction.verifyTransaction(transaction)) {
                console.log(`Invalid signature from ${transaction.input.address}.`);
                return;
            }
            return transaction;
        });
    }

    /**
     * clear all transactions.
     * @memberof TransactionPool
     */
    clear() {
        this.transactions = [];
    }

    /**
     * Get all Transacions
     * @memberof TransactionPool
     */
    getTransactions(){
        return this.transactions
    }
}

/** 
 * It creates a pool of transactions which will be handled by the wallet for mined later.
 * @exports TransactionPool
 */
module.exports = TransactionPool;
