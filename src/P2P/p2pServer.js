const webSocket = require('ws')

const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const P2P_PORT = process.env.P2P_PORT || 5000 + Math.floor(Math.random() * 30);
//const P2P_PORT = process.env.P2P_PORT || 5001;

const MEESAGE_TYPES = { chain: 'CHAIN', transaction: 'TRANSACTION', clear_transactions: 'CLEAR_TRANSACTIONS' }
/**
 * 
 */
class p2pServer {
    /**
     * 
     * @param {blockChain} blockChain 
     * @param {transactionPool} transactionPool 
     */
    constructor(blockChain, transactionPool) {
        this.blockChain = blockChain;
        this.transactionPool = transactionPool;
        this.sockets = [];
    }

    /**
     * 
     */
    listen() {
        const server = new webSocket.Server({ port: P2P_PORT });
        server.on('connection', socket => this.connectSocket(socket));
        this.conectToPeers();
        console.log('escuchando peers conections en el puerto : ' + P2P_PORT)
    }

    /**
     * 
     */
    conectToPeers() {
        peers.forEach(peer => {
            const socket = new webSocket(peer);
            socket.on('open', () => this.connectSocket(socket));
        })
    }

    /**
     * 
     * @param {soket} socket 
     */
    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('[+] conection Soket');
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
                case MEESAGE_TYPES.chain:
                    this.blockChain.replaceChain(data.chain)
                    break;
                case MEESAGE_TYPES.transaction:
                    this.transactionPool.updateOrAddTransaction(data.transaction)
                    break;
                case MEESAGE_TYPES.clear_transactions:
                    this.transactionPool.clear()
                    break;
                default:
                    console.log('Unknown message ')
            }
        })
    }

    /**
     * 
     * @param {soket} socket 
     */
    sendChain(socket) {
        socket.send(JSON.stringify({
            type: MEESAGE_TYPES.chain,
            chain: this.blockChain.getChain()
        }))
    }

    /**
     * 
     */
    syncChains() {
        this.sockets.forEach(socket => {
            this.sendChain(socket);
        });
    }

    /**
     * 
     * @param {soket} socket 
     * @param {transaction} transaction 
     */
    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
            type: MEESAGE_TYPES.transaction,
            transaction
        }))
    }
    /**
     * 
     * @param {transaction} transaction 
     */
    broadcastTrasnsaction(transaction) {
        this.sockets.forEach(socket => {
            this.sendTransaction(socket, transaction)
        });
    }

    /**
     * 
     */
    broadcastClearTrasnsactions() {
        this.sockets.forEach(socket => {
            socket.send(JSON.stringify({
                type: MEESAGE_TYPES.clear_transactions
            }))
        });
    }

    /**
     * 
     * @param {host} host 
     * @param {port} port 
     */
    addPeer(host, port) {
        let connection = new webSocket(`ws://${host}:${port}`)
        connection.on('error', (error) => {
            console.log(error)
        })

        connection.on('open', (msg) => {
            //this.conectToPeers();
            this.connectSocket(connection)
        })
    }
}

module.exports = p2pServer;