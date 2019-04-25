/* eslint-disable no-console */
/* eslint-disable no-undef */
const Block = require("./block");
/**
 * 
 */
class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  /**
   * 
   * @param {data} data 
   */
  addBlock(data) {
    const block = Block.mineBlock(this.getLatestBlock(), data)
    this.chain.push(block)
    return block
  }

  /**
   * Returns the latest block on our chain. Useful when you want to create a
   * new Block and you need the hash of the previous Block.
   *
   * @returns {Block[]}
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Loops over all the blocks in the chain and verify if they are properly
   * linked together and nobody has tampered with the hashes. By checking
   * the blocks it also verifies the (signed) transactions inside of them.
   *
   * @returns {boolean}
   */
  isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;

    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const lastBlock = chain[i - 1];

      if (block.lastHash !== lastBlock.hash ||
        block.hash !== Block.blockHash(block)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Replace the blockchain for a new one
   * @param newChain
   */
  replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      console.log('Received chain is not longer than the current chain.');
      return;
    } else if (!this.isValidChain(newChain)) {
      console.log('The received chain is not valid.');
      return;
    }
    console.log('Replacing blockchain with the new chain.');
    //return this.chain = newChain
    this.chain = newChain
  }

  /**
   * Returns the whole blockchain
   * @return {Array<BrewBlock>}
   */
  getChain() {
    return this.chain
  }
}

module.exports = Blockchain;