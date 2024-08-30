const express = require('express');
const moment = require('moment');

// Server/express setup
const app = express();
const cors = require('cors');
app.use(cors());
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const CoupGame = require('./game/coup');
// const game = new CoupGame([ { name: 'Ethan',
// socketID: '/DPRI33#OJIB1ERYp-M_K-m5AAAD',
// isReady: true },
// { name: 'Joe',
// socketID: '/DPRI33#FbwKBDCgYjPrTgyfAAAE',
// isReady: true },
// { name: 'MAMA',
// socketID: '/DPRI33#NVzRGTKOfFh7IDqHAAAF',
// isReady: true } ], '', '')
// game.start();
// require("./routes")(app);
const utilities = require('./utilities/utilities');

// Constants
const port = 8000;
let namespaces = {}; //AKA party rooms


app.get('/createNamespace', function (req, res) {
    let newNamespace = '';
    while (newNamespace === '' || (newNamespace in namespaces)) {
        newNamespace = utilities.generateNamespace(); //default length 6
    }
    const newSocket = io.of(`/${newNamespace}`);
    openSocket(newSocket, `/${newNamespace}`);
    namespaces[newNamespace] = null;
    console.log(newNamespace + " CREATED")
    res.json({ namespace: newNamespace });
})

app.get('/exists/:namespace', function (req, res) { //returns bool
    const namespace = req.params.namespace;
    res.json({ exists: (namespace in namespaces) });
})

//game namespace: oneRoom
openSocket = (gameSocket, namespace) => {
    let sockets = [];
    let partyMembers = [];
    let partyLeader = '';
    let started;

    gameSocket.on('connection', (socket) => {
        sockets.push({ socket_id: `${socket.id}` });
        console.log(`new socket has connected`);
        socket.join(socket.id);
        console.log('socket joined ' + socket.id);

        clearTimeout(gracePeriodTimeout);
        gracePeriodTimeout = null;

        const updatePartyList = () => {
            console.log(partyMembers);
            gameSocket.emit('partyUpdate', partyMembers.map((member) => {
                const publicMember = { ...member };
                delete publicMember.id;
                return publicMember;
            }));
        }

        // socket.on('g-actionDecision', (action) => {
        //     namespaces[namespace].onChooseAction(action);
        // })

        socket.on('setPlayerInfo', (id, name) => { //when client joins, it will immediately set its name
            const existingPlayer = partyMembers.find(x => x.id === id);

            if (existingPlayer) {
                if (existingPlayer.socketID) {
                    gameSocket.to(socket.id).emit("joinFailed", 'already_connected');
                    return;
                } else {
                    if (name !== existingPlayer.name) {
                        gameSocket.to(socket.id).emit("joinFailed", 'name_changed');
                        return;
                    }
                    existingPlayer.socketID = `${socket.id}`;
                }
            } else {
                if (partyMembers.length >= 6) {
                    gameSocket.to(socket.id).emit("joinFailed", 'party_full');
                    return;
                }

                if (partyMembers.some((member) => member.name === name)) {
                    gameSocket.to(socket.id).emit("joinFailed", 'name_taken');
                    return;
                }
            }

            if (!existingPlayer) {
                partyMembers.push({ id, name, socketID: socket.id, isConnected: true });
            } else {
                existingPlayer.isConnected = true;
                existingPlayer.socketID = socket.id;
            }

            if (partyMembers.length === 1) {
                partyLeader = socket.id;
                partyMembers[0].isReady = true;
                gameSocket.to(socket.id).emit("leader");
                console.log("PARTY LEADER IS: " + partyLeader);
            }

            updatePartyList();
            gameSocket.to(socket.id).emit("joinSuccess");

            if (started) {
                gameSocket.emit('g-addLog', `${name} has rejoined`);
                gameSocket.to(socket.id).emit("startGame");
                const game = namespaces[namespace.substring(1)];
                game.players.find((player) => player.name === name).socketID = socket.id;
                game.updatePlayers();
                game.listen();
            }
        })
        socket.on('setReady', (isReady) => { //when client is ready, they will update this
            const member = partyMembers.find((member) => member.socketID === socket.id)
            console.log(`${member.name} is ready`);
            member.isReady = isReady;
            updatePartyList();
            gameSocket.to(socket.id).emit("readyConfirm");
        })

        socket.on('startGameSignal', (players) => {
            started = true;
            gameSocket.emit('startGame');
            startGame(players, gameSocket, namespace);
        })

        socket.on('disconnect', () => {
            console.log('disconnected: ' + socket.id);
            sockets = sockets.filter((x) => !x.socket_id === socket.id);
            const member = partyMembers.find((x) => x.socketID === socket.id);
            if (!member) {
                return;
            }
            gameSocket.emit('g-addLog', `${member.name} has disconnected`);
            if (!member.isDead) {
                gameSocket.emit('g-addLog', `Game is paused until ${member.name} rejoins!`);
            }
            delete member.socketID;
            member.isConnected = false;
            updatePartyList();
        })
    });
    let gracePeriodTimeout = null;
    let checkEmptyInterval = setInterval(() => {
        if (!gracePeriodTimeout && Object.keys(gameSocket['sockets']).length == 0) {
            gracePeriodTimeout = setTimeout(() => {
                console.log(`grace period ended for ${namespace}`);
                delete io.nsps[namespace];
                delete namespaces[namespace.substring(1)];
                clearInterval(checkEmptyInterval);
                console.log(`${namespace} deleted`)
            }, 300000);
        }
    }, 10000)
}

startGame = (players, gameSocket, namespace) => {
    namespaces[namespace.substring(1)] = new CoupGame(players, gameSocket);
    namespaces[namespace.substring(1)].start();
}

server.listen(process.env.PORT || port, function () {
    console.log(`listening on ${process.env.PORT || port}`);
});
