/* eslint-disable no-console */
/* eslint-disable no-undef */
const ChainUtil = require('../keys/chain-utils');
const { MINING_REWARD } = require('../config/config')

/**
 *
 * Responsible for creating the transactions that users perform within the blockchain
 * @class Transaction
 */
class Transaction {

    /**
     *Creates an instance of Transaction.
     * @memberof Transaction
     */
    constructor() {
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = [];
    }

    /**
     * The transaction is updated with, the parameters of who is sent to who receives and the amount of money.
     * @param {Wallet} senderWallet wallet to send a transaction
     * @param {string} recipient public key of a wallet to recive a transaction.
     * @param {number} amount amounto to send
     * @returns transaction
     * @memberof Transaction
     */
    update(senderWallet, recipient, amount) {
        const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);
        if (amount > senderOutput.amount) {
            console.log(`Amount: ${amount} exceeds balance.`);
            return;
        }
        senderOutput.amount = senderOutput.amount - amount;
        this.outputs.push({ amount, address: recipient });
        Transaction.signTransaction(this, senderWallet);
        return this;
    }

    /**
     * Create a transaction to whom you will send and the amount to be sent.
     * @param {Wallet} senderWallet wallet to send a transaction
     * @param {object} outputs amount to send
     * @static
     * @returns transaction
     * @memberof Transaction
     */
    static transactionWithOutputs(senderWallet, outputs) {
        const transaction = new this();
        transaction.outputs.push(...outputs);
        Transaction.signTransaction(transaction, senderWallet);
        return transaction;
    }

    /**
     * Create a transaction that shows who the amount will be sent to and who sends it.
     * @param {Wallet} senderWallet wallet to send a transaction
     * @param {string} recipient public key of a wallet to recive a transaction.
     * @param {number} amount amounto to send
     * @static
     * @returns
     * @memberof Transaction
     */
    static newTransaction(senderWallet, recipient, amount) {
        if (amount > senderWallet.balance) {
            console.log(`Amount: ${amount} exceeds balance.`);
            return;
        }
        return Transaction.transactionWithOutputs(senderWallet, [
            { amount: senderWallet.balance - amount, address: senderWallet.publicKey },
            { amount, address: recipient }
        ]);
    }

    /**
     * Grants a reward for the user for solving the mining.
     * @param {Wallet} minerWallet wallet to send  reward of a transaction
     * @param {Wallet} blockchainWallet blockchain to inchude a wallet
     * @static
     * @returns
     * @memberof Transaction
     */
    static rewardTransaction(minerWallet, blockchainWallet) {
        return Transaction.transactionWithOutputs(blockchainWallet, [{
            amount: MINING_REWARD, address: minerWallet.publicKey
        }]);
    }

    /**
     * Create the signature for a transaction
     * @param {Transaction} transaction transaction
     * @param {Wallet} senderWallet sender wallet
     * @static
     * @memberof Transaction
     */
    static signTransaction(transaction, senderWallet) {
        transaction.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))
        }
    }

    /**
     * Verify that the signatures correspond to the transaction.
     * @param {Transaction} transaction transaction to verify
     * @static
     * @returns {boolean} true is a signature oi a transaction are correct else return false
     * @memberof Transaction
     */
    static verifyTransaction(transaction) {
        return ChainUtil.verifySignature(transaction.input.address, transaction.input.signature, ChainUtil.hash(transaction.outputs));
    }
}
/** 
 * responsible for creating the transactions that users perform within the blockchain
 * @exports Transaction
 */
module.exports = Transaction;