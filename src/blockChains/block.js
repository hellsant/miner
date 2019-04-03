const ChainUtil = require('../keys/chain-utils')
const { DIFFICULTY, MIME_RATE } = require('../config/config')
class Block {

  /**
   * @param {number} timestamp
   * @param {Transaction[]} transactions
   * @param {string} lastHash
   */
  constructor(timestamp, lastHash, hash, data, nonce,difficulty, processTime) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty || DIFICULTY;
    this.processTime = processTime;
  }
  static genesis() {
    return new this('1-1-2019', '0'.repeat(64), '0'.repeat(64), [], 0, DIFFICULTY,0);
  }

  /**
   * Returns the SHA512 of this block (by processing all the data stored
   * inside this block)
   *
   * @returns {string}
   */
  //calculateHash() {
  //  return SHA256(this.index + this.lastHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
  //}

  /**
   * Starts the mining process on the block. It changes the 'nonce' until the hash
   * of the block starts with enough zeros (= difficulty)
   *
   * @param {number} difficulty
   */
  static mineBlock(lastBlock, data) {
    let hash
    let timespamp
    const lastHash = lastBlock.hash
    let {difficulty} = lastBlock
    let nonce = 0;
    let t1= Date.now()
    do {
      nonce++
      timespamp = Date.now()
      difficulty = Block.adjustDifficulty(lastBlock, timespamp)
      hash = Block.hash(timespamp, lastHash, data, nonce)
    } while (hash.substring(0, DIFFICULTY != '0'.repeat(difficulty)))
    let t2 =Date.now();
    let processTime = t2 - t1
    return new this(timespamp, lastHash, data, hash, nonce,difficulty, processTime)
  }


  static adjustDifficulty(lastBlock,currentTime){
    let {difficulty} = lastBlock
    difficulty = lastBlock.timespamp + MIME_RATE > currentTime ?difficulty +1 : difficulty -1
    return difficulty
  }
  
  static hash(timestamp, lastHash, data, nonce,difficulty) {
    return ChainUtil.hash(`${timestamp}  ${lastHash}  ${data}  ${nonce+difficulty}`).toString();
  }


  static blockHash(block) {
    const { timestamp, lastHash, data, nonce,difficulty } = block;
    return Block.hash(timestamp, lastHash, data, nonce, difficulty);
  }
  /**
   * Validates all the transactions inside this block (signature + hash) and
   * returns true if everything checks out. False if the block is invalid.
   *
   * @returns {boolean}
   */
  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}

module.exports = Block;