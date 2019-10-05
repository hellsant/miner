/* eslint-disable no-console */
/* eslint-disable no-undef */
const Block = require("./block");

/**
 * Responsible for managing the blockchain which will be managed in the P2P network
 *
 * @class Blockchain
 */
class Blockchain {

  /**
   * Creates an instance of Blockchain.
   * @memberof Blockchain
   */
  constructor() {
    this.chain = [Block.genesis()];
  }

  /**
   * Add a new block to the blockchain
   * @param {object} data contains the transaccions into a block
   * @returns the new block in a blockchains beffore added. | Block
   * @memberof Blockchain
   */
  addBlock(data) {
    const block = Block.mineBlock(this.getLatestBlock(), data);
    this.chain.push(block);
    return block;
  }

  /**
   * Returns the latest block on our chain. Useful when you want to create a
   * new Block and you need the hash of the previous Block.
   *
   * @returns {Block[]} the last block of the blockchain | Array
   * @memberof Blockchain
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Loops over all the blocks in the chain and verify if they are properly
   * linked together and nobody has tampered with the hashes. By checking
   * the blocks it also verifies the (signed) transactions inside of them.
   *
   * @param {Blockchain} chain recibe a blockchain to validate
   * @returns {boolean} true if the block is valid else retun false | Boolean
   * @memberof Blockchain
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
   * @param {Blockchain} newChain current blockchain that will be replaced by a new one.
   * @returns a new chain replaced | new Array
   * @memberof Blockchain
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
   * @return {Array<Block>} the blockchain | array
   * @memberof Blockchain
   */
  getChain() {
    return this.chain
  }

  /**
   * Get all the transaccions for the wallet user.
   * @param {String} address address of wallet to review
   * @return {Array<transactions>} Transactions
   * @memberof Blockchain
   */
  getAllTransactionsForWallet(address) {
    const txs = [];
    this.chain.forEach(block => {
      block.data.forEach(outs => {
        outs.outputs.forEach(a => {
          if (a.address === address || outs.input.address === address) {
            txs.push({
              to: outs.input.address, amount: a.amount, from: a.address, blockchainWalletaddress: a.blockchainWalletaddress, timestamp: outs.input.timestamp, key: address
            })
          }
        });
      });
    });
    return txs;
  }
}
/** 
 * Responsible for managing the blockchain which will be managed in the P2P network
 * @exports Blockchain
 */
module.exports = Blockchain;