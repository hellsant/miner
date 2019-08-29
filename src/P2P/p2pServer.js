/* eslint-disable no-console */
/* eslint-disable no-undef */
const Websocket = require('ws');
const P2P_PORT = process.env.P2P_PORT || 5000 + Math.floor(Math.random() * 30);
//const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = { chain: 'CHAIN', transaction: 'TRANSACTION', clear_transactions: 'CLEAR_TRANSACTIONS' }

/**
 * It allows to raise a P2P server in addition to adding new nodes to the network.
 *
 * @class p2pServer
 */
class p2pServer {

    /**
     * Creates an instance of p2pServer.
     * @param {Blockchain} blockChain blockchain
     * @param {TransactionPool} transactionPool Pool of transactions 
     * @memberof p2pServer
     */
    constructor(blockchain, transactionPool) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.sockets = [];
    }

    /**
     * Listened to pairs that must be added to the network
     * @memberof p2pServer
     */
    listen() {
        const server = new Websocket.Server({ port: P2P_PORT });
        server.on('connection', socket => this.connectSocket(socket));
        this.connectToPeers();
        console.log(`Listening for peer-to-peer connections on: ${P2P_PORT}`);
    }

    /**
     * Connects the sockets to the p2p network.
     * @memberof p2pServer
     */
    connectToPeers() {
        peers.forEach(peer => {
            const socket = new Websocket(peer);
            socket.on('open', () => this.connectSocket(socket));
        });
    }

    /**
     * Add the sockets to the p2p network
     * @param {socket} socket sokect
     * @memberof p2pServer
     */
    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Socket connected');
        this.messageHandler(socket);
        this.sendChain(socket);
    }

    /**
     * Get the messages from the socket and handle them according to their type.
     * @param {soket} socket socket
     * @memberof p2pServer
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
     * Send a chain to the network.
     * @param {socket} socket socket
     * @memberof p2pServer
     */
    sendChain(socket) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.chain,
            chain: this.blockchain.chain
        }));
    }

    /**
     * Send a transaction to the network.
     * @param {socket} socket sokect 
     * @param {Transaction} transaction A transaction to send
     * @memberof p2pServer
     */
    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.transaction,
            transaction
        }));
    }

    /**
     * Synchronize blockchain chains.
     * @memberof p2pServer
     */
    syncChains() {
        this.sockets.forEach(socket => this.sendChain(socket));
    }

    /**
     * Notifies all network nodes that a transaction exists.
     * @param {Transaction} transaction a transaction to broadcast in a blockchain
     * @memberof p2pServer
     */
    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
    }

    /**
     * Send a message that transactions are being cleaned.
     * @memberof p2pServer
     */
    broadcastClearTransactions() {
        this.sockets.forEach(socket => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.clear_transactions
        })));
    }

    /**
     * Add peer to p2p 
     * @param {host} host url or ip 
     * @param {port} port port 
     * @memberof p2pServer
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

    /**
     * Close the connection 
     * @param {connection} connection the current node connection
     * @memberof p2pServer
     */
    closeConnection(connection) {
        console.log('closing connection')
        this.sockets.splice(this.sockets.indexOf(connection), 1)
    }

    /**
     * Get P2p port
     * @returns String | Number 
     * @memberof p2pServer
     */
    getP2Pport() {
        return P2P_PORT
    }
}
/**
 * It allows to raise a P2P server in addition to adding new nodes to the network.
 * @exports p2pServer 
 */
module.exports = p2pServer;