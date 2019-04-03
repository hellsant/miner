const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
//const SHA256 = require('js-sha3').sha3_256;
const SHA256 = require('crypto-js/sha256');
const uuid = require('uuid/v1');

class ChainUtil {
    static getKeyPair() {
        return ec.genKeyPair()
    }
    static id() {
        return uuid();
    }
    static hash(data) {
        return SHA256(data).toString();
    }
    static verifySignature(publicKey, signature, dataHash) {
        return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature)
    }

}

module.exports = ChainUtil;