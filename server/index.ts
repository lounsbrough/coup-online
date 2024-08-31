import http from 'http';
import express from 'express';
import cors from 'cors';
import { createNewGame, getGameState, mutateGameState } from './utilities/gameState';

const app = express();
app.use(cors());
const server = http.createServer(app);

const port = 8000;

app.get('/gameState', function (req, res) {
    res.json({});
});

app.post('/createGame', async (req, res) => {
    const roomId = req.body?.roomId;
    const playerId = req.body?.playerId;
    const playerName = req.body?.playerName;

    if (!roomId || !playerId || !playerName) {
        res.status(400).send('room id, player id, and player name are required');
        return;
    }

    if (await getGameState(roomId)) {
        res.status(409).send(`room ${roomId} already exists`);
        return;
    }

    await createNewGame(roomId);

    res.status(200).send();
})

app.post('/joinGame', async (req, res) => {
    const roomId = req.body?.roomId;
    const playerId = req.body?.playerId;
    const playerName = req.body?.playerName;

    if (!roomId || !playerId || !playerName) {
        res.status(400).send('room id, player id, and player name are required');
        return;
    }

    const gameState = await getGameState(roomId);
    if (!gameState) {
        res.status(404).send(`room ${roomId} does not exist`);
        return;
    }

    if (gameState.players.length >= 6) {
        res.status(400).send(`room ${roomId} is full`);
        return;
    }

    if (gameState.isStarted) {
        res.status(400).send(`room ${roomId} is already playing`);
        return;
    }

    await mutateGameState(roomId, (state) => {
        state.players.push({
            id: playerId,
            name: playerName,
            coins: 2,
            influences: Array.from({ length: 2 }, () => gameState.deck.getNextCard())
        })
        return state;
    });

    res.status(200).send();
})

app.post('/action', async (req, res) => {
    const roomId = req.body?.roomId;
    const playerId = req.body?.playerId;

    if (!roomId || !playerId) {
        res.status(400).send('room id and player id are required');
        return;
    }

    const gameState = await getGameState(roomId);

    if (!gameState) {
        res.status(400).send('invalid room id');
        return;
    }

    const player = gameState.players.find(({ id }) => id === playerId)

    if (!player) {
        res.status(400).send('player not in room');
        return;
    }

    // try to process action

    res.json({});
});

server.listen(process.env.PORT || port, function () {
    console.log(`listening on ${process.env.PORT || port}`);
});
