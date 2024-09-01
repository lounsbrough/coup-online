import http from 'http';
import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import { addPlayerToGame, createNewGame, getGameState, getPublicGameState } from './utilities/gameState';
import { generateRoomId } from './utilities/identifiers';

const app = express();
app.use(cors());
app.use(json());
const server = http.createServer(app);

const port = 8000;

app.get('/gameState', async (req, res) => {
    const roomId = req.query?.roomId;
    const playerId = req.query?.playerId;

    if (typeof roomId !== 'string' || typeof playerId !== 'string') {
        res.status(400).send('roomId and playerId are required');
        return;
    }

    const gameState = await getPublicGameState(roomId, playerId);

    if (!gameState) {
        res.status(404).send();
        return;
    }

    res.json(gameState);
});

app.post('/createGame', async (req, res) => {
    const playerId = req.body?.playerId;
    const playerName = req.body?.playerName;

    if (!playerId || !playerName) {
        res.status(400).send('playerId and playerName are required');
        return;
    }

    const roomId = generateRoomId();

    await createNewGame(roomId);
    await addPlayerToGame(roomId, playerId, playerName);

    res.status(200).json({ roomId })
})

app.post('/joinGame', async (req, res) => {
    const roomId = req.body?.roomId;
    const playerId = req.body?.playerId;
    const playerName = req.body?.playerName?.trim();

    if (!roomId || !playerId || !playerName) {
        res.status(400).send('roomId, playerId, and playerName are required');
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

    if (gameState.players.some(({name}) => name.toUpperCase() === playerName.toUpperCase())) {
        res.status(400).send(`room ${roomId} already has player named ${playerName}`);
        return;
    }

    await addPlayerToGame(roomId, playerId, playerName);

    res.status(200).send();
})

app.post('/action', async (req, res) => {
    const roomId = req.body?.roomId;
    const playerId = req.body?.playerId;

    if (!roomId || !playerId) {
        res.status(400).send('roomId and playerId are required');
        return;
    }

    const gameState = await getGameState(roomId);

    if (!gameState) {
        res.status(400).send('invalid room');
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
