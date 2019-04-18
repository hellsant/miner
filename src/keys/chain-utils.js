/* eslint-disable no-undef */
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const sha3_512 = require('js-sha3').sha3_256;
//const {SHA3}  = require('sha3');
//const SHA512 = require('crypto-js/sha512');
const uuid = require('uuid/v4');
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
        return uuid();
    }

    /**
     * 
     * @param {data} data 
     */
    static hash(data) {
        //return SHA512(data).toString(); este funciona
        
        return sha3_512.update(data).toString();

        //return SHA512(JSON.stringify(data)).toString();
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