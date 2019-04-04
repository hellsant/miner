const ChainUtil = require('../keys/chain-utils')
const { DIFFICULTY, MIME_RATE } = require('../config/config')
class Block {

  /**
   * @param {number} timestamp
   * @param {Transaction[]} transactions
   * @param {string} lastHash
   */
  constructor(timestamp, lastHash, hash, data, nonce, difficulty, processTime) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty || DIFFICULTY;
    this.processTime = processTime;
  }

  static genesis() {
    return new this(Date.now(), '0'.repeat(64), '0'.repeat(64), [], 0, DIFFICULTY, 0);
  }

  static mineBlock(lastBlock, data) {
    let hash
    let timespamp
    const lastHash = lastBlock.hash
    let { difficulty } = lastBlock
    let nonce = 0;
    let t1 = Date.now()
    do {
      nonce++
      timespamp = Date.now()
      difficulty = Block.adjustDifficulty(lastBlock, timespamp)
      hash = Block.hash(timespamp, lastHash, data, nonce)
      //console.log(hash)
    } while (hash.substring(0, difficulty) != '0'.repeat(difficulty))
    let t2 = Date.now();
    let processTime = t2 - t1
    return new this(timespamp, lastHash, data, hash, nonce, difficulty, processTime)

  }


  static adjustDifficulty(lastBlock, currentTime) {
    let { difficulty } = lastBlock
    difficulty = lastBlock.timespamp + MIME_RATE > currentTime ? difficulty + 1 : difficulty - 1
    return difficulty
  }

  static hash(timestamp, lastHash, data, nonce, difficulty) {
    return ChainUtil.hash(timestamp + lastHash + data + nonce + difficulty).toString();
  }


  static blockHash(block) {
    const { timestamp, lastHash, data, nonce, difficulty } = block;
    return Block.hash(timestamp, lastHash, data, nonce, difficulty);
  }

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