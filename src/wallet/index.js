/* eslint-disable no-console */
/* eslint-disable no-undef */
const { INITIAL_BALANCE } = require('../config/config')
const ChainUtil = require('../keys/chain-utils')
const Transaction = require('./transaction')
/**
 * 
 */
class Wallet {

    /**
     * Constructor of wallet class
     */
    constructor() {
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtil.getKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    /**
     * Sing of wallet
     * @param {dataHash} dataHash 
     */
    sign(dataHash) {
        return this.keyPair.sign(dataHash)
    }

    /**
     * Create a new Transaccion.
     * @param {recipient} recipient 
     * @param {amount} amount 
     * @param {transactionPool} transactionPool 
     */
    createTransaction(recipient, amount, blockchain, transactionPool) {
        this.balance = this.calculateBalance(blockchain);
        if (amount > this.balance) {
            console.log(`Amount: ${amount} exceceds current balance: ${this.balance}`);
            return;
        }
        let transaction = transactionPool.existingTransaction(this.publicKey);
        if (transaction) {
            transaction.update(this, recipient, amount);
        } else {
            transaction = Transaction.newTransaction(this, recipient, amount);
            transactionPool.updateOrAddTransaction(transaction);
        }
        return transaction;
    }

    /**
     * Calculate the user balance of the transactions made.
     * @param {blockchain} blockchain 
     */
    calculateBalance(blockchain) {
        let balance = this.balance;
        let transactions = [];
        blockchain.chain.forEach(block => block.data.forEach(transaction => {
            transactions.push(transaction);
        }));
        const walletInputTs = transactions.filter(transaction => transaction.input.address === this.publicKey);

        let startTime = 0;

        if (walletInputTs.length > 0) {
            const recentInputT = walletInputTs.reduce(
                (prev, current) => prev.input.timestamp > current.input.timestamp ? prev : current
            );

            balance = recentInputT.outputs.find(output => output.address === this.publicKey).amount;
            startTime = recentInputT.input.timestamp;
        }

        transactions.forEach(transaction => {
            if (transaction.input.timestamp > startTime) {
                transaction.outputs.find(output => {
                    if (output.address === this.publicKey) {
                        balance += output.amount;
                    }
                });
            }
        });
        return balance;
    }

    /**
     * Create a blockchain for the wallet.
     */
    static blockchainWallet() {
        const blockchainWallet = new this();
        blockchainWallet.address = 'Coinbase-0000xxx'
        return blockchainWallet
    }

    /**
     * 
     */
    toString() {
        return `
        wallet
        publicKey:    ${this.publicKey.toString()}
        balance:      ${this.balance}
        `
    }
}
module.exports = Wallet;