/* eslint-disable no-console */
/* eslint-disable no-undef */
const Transaction = require('./transaction');

/**
 * 
 */
class TransactionPool {

    /**
     * Constructor of Transaction Pool
     */
    constructor() {
        this.transactions = [];
    }

    /**
     * Update or add transaction for the blockchain.
     * @param {transaction} transaction 
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
     * @param {address} address 
     */
    existingTransaction(address) {
        return this.transactions.find(t => t.input.address === address);
    }

    /**
     * The verification is done using the signature and the transaction
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
     */
    clear() {
        this.transactions = [];
    }
}

module.exports = TransactionPool;
