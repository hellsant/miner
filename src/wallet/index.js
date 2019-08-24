/* eslint-disable no-console */
/* eslint-disable no-undef */
const { INITIAL_BALANCE } = require('../config/config')
const ChainUtil = require('../keys/chain-utils')
const Transaction = require('./transaction')
/**
 * The user's wallet for transaction handling.
 *
 * @class Wallet
 */
class Wallet {

   
    /**
     *Creates an instance of Wallet.
     * @memberof Wallet
     */
    constructor() {
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtil.getKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    /**
     * Sign of wallet
     * @param {hash} dataHash private key of the user
     * @returns sign 
     * @memberof Wallet
     */
    sign(dataHash) {
        return this.keyPair.sign(dataHash)
    }

    /**
     * Create a new Transaccion.
     * @param {string} recipient User who will receive the transaction
     * @param {number} amount Amount to be sent
     * @param {Blockchain} blockchain Current blockchain
     * @param {TransactionPool} transactionPool Hold transactions
     * @returns transaccion
     * @memberof Wallet
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
     * @param {Blockchain} blockchain blockchain on p2p network.
     * @returns
     * @memberof Wallet
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
     * @static
     * @returns blockchain wallet
     * @memberof Wallet
     */
    static blockchainWallet() {
        const blockchainWallet = new this();
        blockchainWallet.address = 'Coinbase-0000xxx'
        return blockchainWallet
    }

    /**
     * create a wallet information in a string form.
     * @returns a string of a wallet
     * @memberof Wallet
     */
    toString() {
        return `
        wallet
        publicKey:    ${this.publicKey.toString()}
        balance:      ${this.balance}
        `
    }
}
/** 
 * The user's wallet for transaction handling.
 * @exports Wallet 
 */
module.exports = Wallet;