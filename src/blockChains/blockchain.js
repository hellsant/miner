const Block = require("./block");
/**
 * 
 */
class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
    this.difficulty = 3;
    this.pendingTransactions = [];
    this.miningReward = 100; //recompensa
  }

  /**
   * 
   * @param {data} data 
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
   * @returns {Block[]}
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }


  /**
   * Add a new transaction to the list of pending transactions (to be added
   * next time the mining process starts). This verifies that the given
   * transaction is properly signed.
   *
   * @param {Transaction} transaction
   */
  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('La transacción debe incluir desde y hacia la dirección de envio');
    }
    // Verify the transactiion
    if (!transaction.isValid()) {
      throw new Error('No se puede agregar una transacción no valida a la Blockchain');
    }
    this.pendingTransactions.push(transaction);
  }

  /**
   * Returns the balance of a given wallet address.
   *
   * @param {string} address
   * @returns {number} The balance of the wallet
   */
  getBalanceOfAddress(address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }
        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }
    return balance;
  }

  /**
   * Returns a list of all transactions that happened
   * to and from the given wallet address.
   *
   * @param  {string} address
   * @return {Transaction[]}
   */
  getAllTransactionsForWallet(address) {
    const txs = [];
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.fromAddress === address || tx.toAddress === address) {
          txs.push(tx);
        }
      }
    }
    return txs;
  }

  /**
   * Loops over all the blocks in the chain and verify if they are properly
   * linked together and nobody has tampered with the hashes. By checking
   * the blocks it also verifies the (signed) transactions inside of them.
   *
   * @returns {boolean}
   */
  isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false
    }
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const lastBlock = chain[i - 1];
      if (block.lastHash !== lastBlock.hash) {
        console.log('hash anterior incorrecto')
        return false
      }
      if(block.hash !== Block.blockHash(block)) {
        console.log('hash actual incorrecto')
        return false
      }
    }
    return true
  }

  /**
   * Replace the blockchain for a new one
   * @param newChain
   */
  replaceChain(newChain) {

    if (newChain.length <= this.chain.length) {
      console.log("La cadena recibida es mas corta que la actual")
      return
    } else if (!this.isValidChain(newChain)) {
      console.log("la cadena recibida no es valida")
      return
    }
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