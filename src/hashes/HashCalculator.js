/* eslint-disable no-undef */
const SHA512 = require('js-sha3').sha3_512;

class HashCalculator{

    /**
   * Creates a SHA512 hash of the transaction
   *
   * @returns {string}
   */
   calculateTransactionHash() {
    return SHA512(fromAddress + toAddress + amount + timestamp).toString();
  }
  
  /**
   * Returns the SHA512 of this block (by processing all the data stored
   * inside this block)
   *
   * @returns {string}
   */
  calculateBlockHash() {
    return SHA512( index + previousHash + timestamp + JSON.stringify(transactions) + nonce).toString();
  }
}
module.exports = HashCalculator;