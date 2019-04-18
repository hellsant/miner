/* eslint-disable no-mixed-operators */
/* eslint-disable max-lines-per-function */
/* eslint-disable no-undef */
const Wallet = require('../src/wallet/index');
const TransactionPool = require('../src/wallet/transaction-pool');
const Blockchain = require('../src/blockChains/blockchain');
const { INITIAL_BALANCE } = require('../src/config/config');

describe('Wallet', () => {
  let bc, tp, wallet;

  beforeEach(() => {
    wallet = new Wallet();
    tp = new TransactionPool();
    bc = new Blockchain();
  });

  describe('creating a transaction', () => {
    let recipient, sendAmount, transaction;

    beforeEach(() => {
      sendAmount = 50;
      recipient = 'RandomAddress';
      transaction = wallet.createTransaction(recipient, sendAmount, bc, tp);
    });

    describe('and doing the same transaction', () => {
      beforeEach(() => {
        wallet.createTransaction(recipient, sendAmount, bc, tp);
      });

      it('doubles the `sendAmount` subtracted from the wallet balance', () => {
        expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount).
          toEqual(wallet.balance - sendAmount * 2);
      });

      it('clones the `sendAmount` output for the recipient', () => {
        expect(transaction.outputs.filter(output => output.address === recipient).
          map(output => output.amount)).toEqual([sendAmount,
sendAmount]);
      });
    });
  });

  describe('calculating a balance', () => {
    let addBalance, repeatAdd, senderWallet;

    beforeEach(() => {
      senderWallet = new Wallet();
      addBalance = 100;
      repeatAdd = 3;
      for (let i = 0; i < repeatAdd; i++) {
        senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
      }
      bc.addBlock(tp.transactions);
    });

    it('calculates the balance for blockchain transactions matching the recipient', () => {
      expect(wallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE + addBalance * repeatAdd);
    });

    it('calculates the balance for blockchain transactions matching the sender', () => {
      expect(senderWallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE - addBalance * repeatAdd);
    });

    describe('and the recipient conducts a transaction', () => {
      let recipientBalance, subtractBalance;

      beforeEach(() => {
        tp.clear();
        subtractBalance = 60;
        recipientBalance = wallet.calculateBalance(bc);
        wallet.createTransaction(senderWallet.publicKey, subtractBalance, bc, tp);
        bc.addBlock(tp.transactions);
      });

      describe('and the sender sends another transaction to the recipient', () => {
        beforeEach(() => {
          tp.clear();
          senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
          bc.addBlock(tp.transactions);
        });

        it('calculate the recipient balance only using transactions since its most recent one', () => {
          expect(wallet.calculateBalance(bc)).toEqual(recipientBalance - subtractBalance + addBalance);
        });
      });
    });
  });
});