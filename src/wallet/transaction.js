const ChainUtil = require('../keys/chain-utils');
const { MINING_REWARD } = require('../config/config')
class Transaction {

    constructor() {
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = [];
    }

    update(senderWallet, recipient, amount) {
        const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey)
        if (amount > senderOutput.amount) {
            console.log('amount exede el valalce' + amount)
        }
        senderOutput.amount = senderOutput.amount - amount
        this.outputs.push({ amount, address: recipient })
        Transaction.singTransaction(this, senderWallet)
    }

    static newTransaction(senderWallet, recipient, amount) {
        const transaction = new this();
        if (amount > senderWallet.balance) {
            console.log('exede el valance: ' + amount)
            return;
        }
        Transaction.transactionWithOutputs(senderWallet, [
            { amount: senderWallet.balance - amount, address: senderWallet.publicKey },
            { amount, address: recipient }
        ])
    }

    static rewardTransaction(minerWallet, senderWallet) {
        return Transaction.transactionWithOutputs(senderWallet, [{
            amount: MINING_REWARD,
            address: minerWallet.publicKey
        }])
    }
    static transactionWithOutputs(senderWallet, outputs) {
        const transaction = new this();
        this.outputs.push(outputs)
        Transaction.singTransaction(transaction, senderWallet)
        return transaction
    }
    static singTransaction(transaction, senderWallet) {
        transaction.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(ChainUtil.hash(this.outputs))
        }
    }

    static verifyTransaction(transaction) {
        return ChainUtil.verifySignature(transaction.input.address, transaction.input.signature, ChainUtil.hash(transaction.outputs))
    }
}

module.exports = Transaction;