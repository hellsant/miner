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
     * @param {senderWallet} senderWallet 
     * @param {recipient} recipient 
     * @param {amount} amount 
     */
    update(senderWallet, recipient, amount) {
        const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey)
        if (amount > senderOutput.amount) {
            console.log('amount exede el valalce' + amount)
            return
        }
        senderOutput.amount = senderOutput.amount - amount
        this.outputs.push({ amount, address: recipient })
        Transaction.singTransaction(this, senderWallet)
        return this;
    }

    /**
     * 
     * @param {senderWallet} senderWallet 
     * @param {recipient} recipient 
     * @param {amount} amount 
     */
    static newTransaction(senderWallet, recipient, amount) {
        if (amount > senderWallet.balance) {
            console.log('exede el valance: ' + amount)
            return;
        }
        return Transaction.transactionWithOutputs(senderWallet, [
            { amount: senderWallet.balance - amount, address: senderWallet.publicKey },
            { amount, address: recipient }
        ])
    }

    /**
     * 
     * @param {minerWallt} minerWallet 
     * @param {senderWallet} senderWallet 
     */
    static rewardTransaction(minerWallet, senderWallet) {
        return Transaction.transactionWithOutputs(senderWallet, [{
            amount: MINING_REWARD,
            address: minerWallet.publicKey
        }])
    }

    /**
     * 
     * @param {senserWallet} senderWallet 
     * @param {outputs} outputs 
     */
    static transactionWithOutputs(senderWallet, outputs) {
        const transaction = new this()
        transaction.outputs.push(...outputs)
        Transaction.singTransaction(transaction, senderWallet)
        return transaction
    }

    /**
     * 
     * @param {transaction} transaction 
     * @param {senderWallet} senderWallet 
     */
    static singTransaction(transaction, senderWallet) {
        return transaction.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(ChainUtil.hash(this.outputs))
        }
    }

    /**
     * 
     * @param {transaction} transaction 
     */
    static verifyTransaction(transaction) {
        return ChainUtil.verifySignature(transaction.input.address, transaction.input.signature, ChainUtil.hash(transaction.outputs))
    }
}

module.exports = Transaction;