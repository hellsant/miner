/* eslint-disable no-console */
/* eslint-disable no-undef */
const ChainUtil = require('../keys/chain-utils');
const { MINING_REWARD } = require('../config/config')
/**
 * 
 */
class Transaction {

    /**
     * Transaction contructor  
     */
    constructor() {
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = [];
    }

    /**
     * The transaction is updated with, the parameters of who is sent to who receives and the amount of money.
     * @param {senserWallet} senderWallet 
     * @param {recipient} recipient 
     * @param {amount} amount 
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
     * @param {senderWallet} senderWallet 
     * @param {outputs} outputs 
     */
    static transactionWithOutputs(senderWallet, outputs) {
        const transaction = new this();
        transaction.outputs.push(...outputs);
        Transaction.signTransaction(transaction, senderWallet);
        return transaction;
    }

    /**
     * Create a transaction that shows who the amount will be sent to and who sends it.
     * @param {senderWallet} senderWallet 
     * @param {recipient} recipient 
     * @param {amount} amount 
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
     * @param {minerWallet} minerWallet 
     * @param {blockchainWallet} blockchainWallet 
     */
    static rewardTransaction(minerWallet, blockchainWallet) {
        return Transaction.transactionWithOutputs(blockchainWallet, [{
            amount: MINING_REWARD, address: minerWallet.publicKey
        }]);
    }

    /**
     * Create the signature for a transaction
     * @param {transaction} transaction 
     * @param {senserWallet} senderWallet 
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
     * @param {transaction} transaction 
     */
    static verifyTransaction(transaction) {
        return ChainUtil.verifySignature(transaction.input.address, transaction.input.signature, ChainUtil.hash(transaction.outputs));
    }
}

module.exports = Transaction;