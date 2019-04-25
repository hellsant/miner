/* eslint-disable no-console */
/* eslint-disable no-undef */
const ChainUtil = require('../keys/chain-utils');
const { MINING_REWARD } = require('../config/config')
/**
 * 
 */
class Transaction {
    /**
     *      
     */
    constructor() {
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = [];
    }

    /**
     * 
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
     * 
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
     * 
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
     * 
     * @param {minerWallet} minerWallet 
     * @param {blockchainWallet} blockchainWallet 
     */
    static rewardTransaction(minerWallet, blockchainWallet) {
        return Transaction.transactionWithOutputs(blockchainWallet, [{
            amount: MINING_REWARD, address: minerWallet.publicKey
        }]);
    }

    /**
     * 
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
     * 
     * @param {transaction} transaction 
     */
    static verifyTransaction(transaction) {
        return ChainUtil.verifySignature(transaction.input.address, transaction.input.signature, ChainUtil.hash(transaction.outputs));
    }
}

module.exports = Transaction;