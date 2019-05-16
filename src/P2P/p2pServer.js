/* eslint-disable no-console */
/* eslint-disable no-undef */
const Websocket = require('ws');
const P2P_PORT = process.env.P2P_PORT || 5000 + Math.floor(Math.random() * 30);
//const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = { chain: 'CHAIN', transaction: 'TRANSACTION', clear_transactions: 'CLEAR_TRANSACTIONS' }

/**
 * 
 */
class p2pServer {
    /**
     * 
     * @param {blockChain} blockChain 
     * @param {transactionPool} transactionPool 
     */
    constructor(blockchain, transactionPool) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.sockets = [];
    }

    /**
     * Listened to pairs that must be added to the network
     */
    listen() {
        const server = new Websocket.Server({ port: P2P_PORT });
        server.on('connection', socket => this.connectSocket(socket));
        this.connectToPeers();
        console.log(`Listening for peer-to-peer connections on: ${P2P_PORT}`);
    }

    /**
     * Connects the sockets to the p2p network
     */
    connectToPeers() {
        peers.forEach(peer => {
            const socket = new Websocket(peer);
            socket.on('open', () => this.connectSocket(socket));
        });
    }

    /**
     * Add the sockets to the p2p network
     * @param {socket} socket 
     */
    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Socket connected');
        this.messageHandler(socket);
        this.sendChain(socket);
    }

    /**
     * 
     * @param {soket} socket 
     */
    messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.parse(message);
            switch (data.type) {
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain);
                    break;
                case MESSAGE_TYPES.transaction:
                    this.transactionPool.updateOrAddTransaction(data.transaction);
                    break;
                case MESSAGE_TYPES.clear_transactions:
                    this.transactionPool.clear();
                    break;
                default:
                    console.log('Unknown message');
            }
        });
    }

    /**
     * 
     * @param {socket} socket 
     */
    sendChain(socket) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.chain,
            chain: this.blockchain.chain
        }));
    }

    /**
     * 
     * @param {socket} socket 
     * @param {transaction} transaction 
     */
    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.transaction,
            transaction
        }));
    }

    /**
     * 
     */
    syncChains() {
        this.sockets.forEach(socket => this.sendChain(socket));
    }

    /**
     * 
     * @param {transaction} transaction 
     */
    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
    }

    /**
     * 
     */
    broadcastClearTransactions() {
        this.sockets.forEach(socket => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.clear_transactions
        })));
    }

    /**
     * 
     * @param {host} host 
     * @param {port} port 
     */
    addPeer(host, port) {
        let connection = new Websocket(`ws://${host}:${port}`)
        connection.on('error', (error) => {
            console.log(error)
        })
        connection.on('open', () => {
            //this.conectToPeers();
            this.connectSocket(connection)
        })
    }

    closeConnection(connection) {
        console.log('closing connection')
        this.sockets.splice(this.sockets.indexOf(connection), 1)
    }

    getP2Pport() {
        return P2P_PORT
    }
}

module.exports = p2pServer;