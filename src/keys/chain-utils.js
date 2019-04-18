/* eslint-disable no-undef */
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
// //const sha3_512 = require('sha3').SHA3;
// //const a = new sha3_512(512)
const SHA512 = require('crypto-js/sha3');
const uuidV4 = require('uuid/v4');
/**
 * 
 */
class ChainUtil {
    /**
     * 
     */
    static getKeyPair() {
        return ec.genKeyPair()
    }

    /**
     * 
     */
    static id() {
        return uuidV4();
    }

    /**
     * 
     * @param {data} data 
     */
    static hash(data) {
        return SHA512(data).toString();
        //let res = a.update(data)
        //return JSON.stringify(res)
    }

    /**
     * 
     * @param {publicKey} publicKey 
     * @param {signature} signature 
     * @param {dataHash} dataHash 
     */
    static verifySignature(publicKey, signature, dataHash) {
        return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature)
    }

}

module.exports = ChainUtil;