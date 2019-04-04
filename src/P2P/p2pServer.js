const webSocket = require('ws')

const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
//const P2P_PORT = process.env.P2P_PORT || 5000 + Math.floor(Math.random() * 30);
const P2P_PORT = process.env.P2P_PORT || 5001;

const MEESAGE_TYPES = { hain: 'CHAIN', transaction: 'TRANSACTION', clear_transactions: 'CLEAR_TRANSACTIONS' }
class p2pServer {
    constructor(blockChain, transactionPool) {
        this.blockChain = blockChain;
        this.transactionPool = transactionPool;
        this.sockets = [];
    }

    listen() {

        const server = new webSocket.Server({ port: P2P_PORT });
        server.on('connection', socket => this.connectSocket(socket));
        this.conectToPeers();
        console.log('escuchando peers conections en el puerto : ' + P2P_PORT)
    }

    conectToPeers() {
        peers.forEach(peer => {
            const socket = new webSocket(peer);
            socket.on('open', ()=> this.connectSocket(socket));
        })
    }

    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('[+] conection Soket');
        this.messageHandler(socket);
        this.sendChain(socket);
    }

    messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.parse(message);
            switch (data.type) {
                case MEESAGE_TYPES.chain:
                    this.blockChain.repaceChain(data.chain)
                    break;
                case MEESAGE_TYPES.transaction:
                    this.transactionPool.updateOrAddTransaction(data.transaction)
                    break;
                case MEESAGE_TYPES.clear_transactions:
                    this.transactionPool.clear()
                    break;
            }
        })
    }

    sendChain(socket) {
        socket.send(JSON.stringify({
            type: MEESAGE_TYPES.chain,
            chain: this.blockChain.chain
        }))
    }

    syncChains() {
        this.sockets.forEach(socket => {
            this.sendChain(socket);
        });
    }

    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
            type: MEESAGE_TYPES.transaction,
            transaction
        }))
    }
    broadcastTrasnsaction(transaction) {
        this.sockets.forEach(socket => {
            this.sendTransaction(socket, transaction)
        });
    }
    broadcastClearTrasnsactions() {
        this.sockets.forEach(socket => {
            socket.send(JSON.stringify({
                type: MEESAGE_TYPES.clear_transactions
            }))
        });
    }
}

module.exports = p2pServer;