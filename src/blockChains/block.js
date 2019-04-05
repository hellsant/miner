const ChainUtil = require('../keys/chain-utils')
const { DIFFICULTY, MIME_RATE } = require('../config/config')
/**
 * 
 */
class Block {

 /**
  * 
  * @param {timestamp} timestamp 
  * @param {lasHash} lastHash 
  * @param {hash} hash 
  * @param {data} data 
  * @param {nonce} nonce 
  * @param {diffiulty} difficulty 
  * @param {processTime} processTime 
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

  /**
   * 
   */
  static genesis() {
    return new this(Date.parse('2019-01-01'), '0'.repeat(64), '0'.repeat(64), [], 0, DIFFICULTY, 0);
  }

  /**
   * 
   * @param {lastBlock} lastBlock 
   * @param {data} data 
   */
  static mineBlock(lastBlock, data) {
    let hash
    let timestamp
    const lastHash = lastBlock.hash
    let { difficulty } = lastBlock
    let nonce = 0;
    let t1 = Date.now()
    do {
      nonce++
      timestamp = Date.now()
      difficulty = Block.adjustDifficulty(lastBlock, timestamp)
      hash = Block.hash(timestamp, lastHash, data, nonce)
    } while (hash.substring(0, difficulty) !== Array(difficulty + 1).join('0'))
    let t2 = Date.now();
    let processTime = t2 - t1
    return new this(timestamp, lastHash, hash, data, nonce, difficulty, processTime)
  }

  /**
   * 
   * @param {lastBlock} lastBlock 
   * @param {currentTime} currentTime 
   */
  static adjustDifficulty(lastBlock, currentTime) {
    let { difficulty } = lastBlock
    difficulty = lastBlock.timestamp + MIME_RATE > currentTime ? difficulty + 1 : difficulty - 1
    return difficulty
  }

  /**
   * 
   * @param {timestamp} timestamp 
   * @param {lasHash} lastHash 
   * @param {data} data 
   * @param {nonce} nonce 
   * @param {difficulty} difficulty 
   */
  static hash(timestamp, lastHash, data, nonce, difficulty) {
    return ChainUtil.hash(timestamp + lastHash + data + nonce + difficulty).toString();
  }

  /**
   * 
   * @param {block} block 
   */
  static blockHash(block) {
    const { timestamp, lastHash, data, nonce, difficulty } = block;
    return Block.hash(timestamp, lastHash, data, nonce, difficulty);
  }

  /**
   * 
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