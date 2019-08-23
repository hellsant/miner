/* eslint-disable no-undef */
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const SHA512 = require('crypto-js/sha3');
const uuidV4 = require('uuid/v4');

/**
 * 
 */
class ChainUtil {
    
    /**
     * Generation of the peer corresponding to the public key
     */
    static getKeyPair() {
        return ec.genKeyPair()
    }

    /**
     * Generator of an ID V4
     */
    static id() {
        return uuidV4();
    }

    /**
     * Returns a string with the hash sha512
     * @param {data} data 
     */
    static hash(data) {
        return SHA512(JSON.stringify(data)).toString();
    }

    /**
     * Validation of the signature of a transaction.
     * @param {publicKey} publicKey 
     * @param {signature} signature 
     * @param {dataHash} dataHash 
     */
    static verifySignature(publicKey, signature, dataHash) {
        return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature)
    }

}

module.exports = ChainUtil;