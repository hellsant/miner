/* eslint-disable no-console */
/* eslint-disable no-undef */
const { INITIAL_BALANCE, COIN_BASE_BALANCE } = require('../config/config');
const ChainUtil = require('../keys/chain-utils');
const Transaction = require('./transaction');
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
        this.blockchaInWallet = Wallet;
        this.lastBlockTimestamp = 0;
        this.lastBlockBalanceCalc = 0;
    }

    /**
     * Sign of wallet
     * @param {hash} dataHash private key of the user
     * @returns sign 
     * @memberof Wallet
     */
    sign(dataHash) {
        return this.keyPair.sign(dataHash);
    }

    /**
     * verify the private key match to public key
     * @param {string} key private key
     * @returns Boolean
     * @memberof Wallet
     */
    verifyWalletKeys(key) {
        return ChainUtil.verifySignatureWallet(key) === this.publicKey;
    }

    /**
     * Create a new Transaccion.
     * @param {string} recipient User who will receive the transaction
     * @param {number} amount Amount to be sent
     * @param {Blockchain} blockchain Current blockchain
     * @param {TransactionPool} transactionPool Hold transactions
     * @returns Transaction
     * @memberof Wallet
     */
    createTransaction(recipient, amount, blockchain, transactionPool) {
        this.balance = this.calculateBalance(blockchain);
        if (amount > this.balance) {
            console.log(`Amount: ${amount} exceceds current balance: ${this.balance}`);
            return null;
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
     * @param {Blockchain} blockchain Blockchain to use for calculating the wallet balance.
     * @returns Number
     * @memberof Wallet
     */
    calculateBalance(blockchain) {
        let balance = this.balance;
        let transactions = [];
        this.lastBlockTimestamp = blockchain.getLatestBlock().timestamp;
        if (this.lastBlockBalanceCalc === this.lastBlockTimestamp && this.lastBlockBalanceCalc > 0) {
            return balance;
        }
        let startBlockIndex = 0;
        let blocks = blockchain.getChain();
        for (let i = blocks.length - 1; i >= 0; i--) {
            if (blocks[i].timestamp === this.lastBlockBalanceCalc) {
                startBlockIndex = i + 1;
                break;
            }
        }
        for (let i = startBlockIndex; i < blocks.length; i++) {
            let blockTransactions = blocks[i].data;
            for (let j = 0; j < blockTransactions.length; j++) {
                transactions.push(blockTransactions[j]);
            }
        }

        const walletInputsTransacions = transactions.filter(transaction => transaction.input.address === this.publicKey);
        const walletDepositTransactions = transactions.filter(transaction => {
            for (let i = 1; i < transaction.outputs.length; i++) {
                if (transaction.outputs[i].address === this.publicKey && transaction.input.address !== this.publicKey) return true;
            }
            return false;
        });

        for (let i = 0; i < walletInputsTransacions.length; i++) {
            for (let j = 1; j < walletInputsTransacions[i].outputs.length; j++) {
                balance -= walletInputsTransacions[i].outputs[j].amount;
            }
        }

        for (let i = 0; i < walletDepositTransactions.length; i++) {
            for (let j = 1; j < walletDepositTransactions[i].outputs.length; j++) {
                if (walletDepositTransactions[i].outputs[j].address === this.publicKey) {
                    balance += walletDepositTransactions[i].outputs[j].amount;
                }
            }
        }
        this.lastBlockBalanceCalc = this.lastBlockTimestamp;
        this.balance = balance;
        return balance;
    }

    /**
     * Create a blockchain for the wallet.
     * Coin Base
     * @static
     * @returns Blockchain wallet | Coinbase
     * @memberof Wallet
     */
    static blockchainWallet() {
        if (!Wallet.blockchaInWallet) {
            Wallet.blockchaInWallet = new this();
            Wallet.blockchaInWallet.address = 'CoinBase-0000FFFF';
            Wallet.blockchaInWallet.balance = COIN_BASE_BALANCE;
        }
        return Wallet.blockchaInWallet;
    }

    /**
     * create a wallet information in a string form.
     * @returns A string of a wallet | String
     * @memberof Wallet
     */
    toString() {
        return `
        wallet
        publicKey:    ${this.publicKey.toString()}
        balance:      ${this.balance}
        `;
    }
}
/** 
 * The user's wallet for transaction handling.
 * @exports Wallet 
 */
module.exports = Wallet;