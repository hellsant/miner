/* eslint-disable no-undef */
const Transaction = require('./transaction');

/**
 * 
 */
class TransactionPool {
    
    /**
     * 
     */
    constructor() {
        this.transactions = [];
    }

    /**
     * 
     * @param {transactions} transactions 
     */
    updateOrAddTransaction(transactions) {
        let transactionWithId = this.transactions.find(t => t.id === transactions.id)
        if (transactionWithId) {
            this.transactions[this.transactions.indexOf(transactionWithId)] = transactions

        } else {
            this.transactions.push(transactions)
        }
    }

    /**
     * 
     * @param {address} address 
     */
    existingTransaction(address) {
        return this.transactions.find(t => t.input.address === address)
    }

    /**
     * 
     */
    validTransactions() {
        return this.transactions.filter(transaction => {
            const outputTotal = transaction.outputs.reduce((total, output) => {
                return total + output.amount
            }, 0)
            if (transaction.input.amount !== outputTotal) {
                Console.log(`invalid transaction from: ${transaction.input.address}`)
                return
            }
            if (!Transaction.verifyTransaction(transaction)) {
                Console.log(`invalid signature from: ${transaction.input.address}`)
                return
            }
            return transaction
        })
    }

    /**
     * 
     */
    clear() {
        this.transactions = []
    }
}

module.exports = TransactionPool;
