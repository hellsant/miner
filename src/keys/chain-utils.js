/* eslint-disable no-undef */
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const SHA512 = require('crypto-js/sha3');
const uuidV4 = require('uuid/v4');

/**
 * Responsible for managing the security of the system.
 *
 * @class ChainUtil
 */
class ChainUtil {

    /**
     * Generation of the peer corresponding to the public key
     * @static
     * @returns the pair is correct
     * @memberof ChainUtil
     */
    static getKeyPair() {
        return ec.genKeyPair()
    }

    /**
     * Generator of an ID V4
     * @static
     * @returns An id of V4 | uuidV4
     * @memberof ChainUtil
     */
    static id() {
        return uuidV4();
    }

    /**
     * Create the hash 512 for the received parameter
     * @param {object} data information that will be hashed
     * @static
     * @returns  String | sha512
     * @memberof ChainUtil
     */
    static hash(data) {
        return SHA512(JSON.stringify(data)).toString();
    }

    /**
     * Validation of the signature of a transaction.
     * @param {string} publicKey public key to send a transaction
     * @param {string} signature signatue of address to send a transaction
     * @param {hash} dataHash transaction hash
     * @static
     * @returns {boolean} True if signature are correct else retunrs false | Boolean
     * @memberof ChainUtil
     */
    static verifySignature(publicKey, signature, dataHash) {
        return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature)
    }

}

/**
 * Responsible for managing the security of the system.
 * @exports ChainUtil
 */
module.exports = ChainUtil;