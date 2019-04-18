/* eslint-disable max-lines-per-function */
/* eslint-disable no-undef */
const Wallet = require('../src/wallet/index');
const TransactionPool = require('../src/wallet/transaction-pool');
const Blockchain = require('../src/blockChains/blockchain');

describe('TransactionPool', () => {
    let bc, tp, transaction, wallet;

    beforeEach(() => {
        tp = new TransactionPool();
        wallet = new Wallet();
        bc = new Blockchain();
        transaction = wallet.createTransaction('barddress', 30, bc, tp);
    });

    it('adds a transaction to the pool', () => {
        expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
    });

    it('updates a transaction in the pool', () => {
        const oldTransaction = JSON.stringify(transaction);
        const newTransaction = transaction.update(wallet, 'fooddress', 40);
        tp.updateOrAddTransaction(newTransaction);

        expect(JSON.stringify(tp.transactions.find(t => t.id === newTransaction.id))).
            not.toEqual(oldTransaction);
    });

    it('clears transactions', () => {
        tp.clear();
        expect(tp.transactions).toEqual([]);
    });

    describe('mixing valid and corrupt transactions', () => {
        let validTransactions;

        beforeEach(() => {
            validTransactions = [...tp.transactions];
            for (let i = 0; i < 6; i++) {
                wallet = new Wallet();
                transaction = wallet.createTransaction('addressRecipend', 30, bc, tp);
                if (i % 2 === 0) {
                    transaction.input.amount = 99999;
                } else {
                    validTransactions.push(transaction);
                }
            }
        });

        it('shows a difference between valid and corrupt transactions', () => {
            expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTransactions));
        });

        it('grabs valid transactions', () => {
            expect(tp.validTransactions()).toEqual(validTransactions);
        });
    });
});