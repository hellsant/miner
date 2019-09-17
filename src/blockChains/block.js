/* eslint-disable no-undef */
const ChainUtil = require('../keys/chain-utils')
const { DIFFICULTY, MINE_RATE } = require('../config/config')

/**
 *
 * The block is the container of the transactions made that will be added to the blockchain
 * @class Block
 */
class Block {

  /**
   * Creates an instance of Block.
   * @param {number} index index of block
   * @param {timestamp} timestamp records the time the block was created
   * @param {hash} lastHash Hash of last block
   * @param {hash} hash Hash Actual for the block
   * @param {object} data Transasctions to add in a block
   * @param {number} nonce Amount of zeros added to the block so the hash will be resolved
   * @param {number} difficulty Difficulty of mine a block 
   * @param {timestamp} processTime time to create a block 
   * @memberof Block
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
   * Method that initializes the genesis node of the blockchain.
   * @static
   * @returns the first node or node genesis. | Block
   * @memberof Block
   */
  static genesis() {
    return new this(0, Date.parse('2019-01-01'), '0'.repeat(64), '0'.repeat(64), [], 0, DIFFICULTY, 0);
  }

  /**
   * mined from a block, the difficulty is adjusted in addition to
   * calculating the processing time thereof.
   * @param {Block} lastBlock previous blockchain block
   * @param {object} data transactions that will be added to the current block.
   * @static
   * @returns A block with its corresponding hash. | Block hashed
   * @memberof Block
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
    } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty))
    const t2 = Date.now()
    const processTime = t2 - t1
    return new this(newIndex, timestamp, lastHash, hash, data, nonce, difficulty, processTime)
  }

  /**
   * validate a actual block hash.
   * @param {Number} index block index
   * @param {number} timestamp Date of Block
   * @param {String} lastHash Last hash of block
   * @param {Object} data Transacctions
   * @param {Number} nonce Number of zeros added the beginning of the hash.
   * @param {Number} difficulty Dificulty to add in nonce.
   * @returns A block with its corresponding hash. | Block hashed
   * @memberof Block
   */
  validateHash(index, timestamp, lastHash, data, nonce, difficulty) {
    return Block.hasher(index, timestamp, lastHash, data, nonce, difficulty)
  }

  /**
   * adjust the difficulty according to the processing time 
   * and the difficulty of the previous block.
   * @param {Block} lastBlock previous blockchain block
   * @param {timestamp} currentTime current time for mining
   * @static
   * @returns the new difficulty for the mining of the next block. | Number
   * @memberof Block
   */
  static adjustDifficulty(lastBlock, currentTime) {
    let { difficulty } = lastBlock
    difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1
    if (difficulty == 0) {
      difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty - 1 : difficulty + 3
    }
    return difficulty
  }

  /**
   * create a hash for the current block
   * @static
   * @param {number} index index of block
   * @param {timestamp} timestamp records the time the block was created
   * @param {hash} lastHash Hash of last block
   * @param {object} data Transasctions to add in a block
   * @param {number} nonce Amount of zeros added to the block so the hash will be resolved
   * @param {number} difficulty Difficulty of mine a block 
   * @returns A block with a hash | String Hash
   * @memberof Block
   */
  static hasher(index, timestamp, lastHash, data, nonce, difficulty) {
    return ChainUtil.hash(`${index}${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
  }

  /**
   * Create a hash for the block.
   * @param {Block} block the block that will be hashed
   * @static
   * @returns A block already hashed. | Hash
   * @memberof Block
   */
  static blockHash(block) {
    const { index, timestamp, lastHash, data, nonce, difficulty } = block;
    return Block.hasher(index, timestamp, lastHash, data, nonce, difficulty);
  }


  /**
   *create a string with the block information
   *
   * @returns the content of a block in the form of a string
   * @memberof Block
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

  /**
     *create a string with the block information for comparations.
     *
     * @returns the content of a block in the form of a string
     * @memberof Block
     */
  toStringComparable() {
    return this.lastHash + this.nonce + this.difficulty + this.index + this.timestamp;
  }
}
/**
 * The block is the container of the transactions made that will be added to the blockchain
 * @exports Block
 */
module.exports = Block;