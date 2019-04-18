/* eslint-disable no-undef */
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
  constructor(index, timestamp, lastHash, hash, data, nonce, difficulty, processTime) {
    this.index = index;
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
    return new this(0, Date.parse('2019-01-01'), '0'.repeat(64), '0'.repeat(64), [], 0, DIFFICULTY, 0);
  }

  /**
   * 
   * @param {lastBlock} lastBlock 
   * @param {data} data 
   */
  static mineBlock(lastBlock, data) {
    const t1 = Date.now()
    const newIndex = lastBlock.index + 1
    const lastHash = lastBlock.hash
    let hash
    let timestamp
    let { difficulty } = lastBlock
    let nonce = 0
    do {
      nonce++
      timestamp = Date.now()
      difficulty = Block.adjustDifficulty(lastBlock, timestamp)
      hash = Block.hasher(newIndex, timestamp, lastHash, data, nonce, difficulty)
    } while (hash.substring(0, difficulty) !== Array(difficulty + 1).join('0'))
    const t2 = Date.now()
    const processTime = t2 - t1
    return new this(newIndex, timestamp, lastHash, hash, data, nonce, difficulty, processTime)
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
  static hasher(index, timestamp, lastHash, data, nonce, difficulty) {
    return ChainUtil.hash(index + timestamp + lastHash + data + nonce + difficulty).toString();
  }

  /**
   * 
   * @param {block} block 
   */
  static blockHash(block) {
    const { index, timestamp, lastHash, data, nonce, difficulty } = block;
    return Block.hasher(index, timestamp, lastHash, data, nonce, difficulty);
  }
  
  /**
   * 
   */
  toString() {
    return `Block -
      Index      : ${this.index}
      Timestamp  : ${this.timestamp}
      Last Hash  : ${this.lastHash.substring(0, 10)}
      Hash       : ${this.hash.substring(0, 10)}
      Nonce      : ${this.nonce}
      Difficulty : ${this.difficulty}
      Data       : ${this.data}
      ProsessTime: ${this.processTime}`;
  }
}

module.exports = Block;