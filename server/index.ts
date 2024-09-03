import http from 'http';
import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import { addPlayerToGame, createNewGame, getGameState, getPublicGameState, mutateGameState } from './utilities/gameState';
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

app.post('/startGame', async (req, res) => {
    const roomId = req.body?.roomId;

    if (!roomId) {
        res.status(400).send('roomId is required');
        return;
    }

    const gameState = await getGameState(roomId);

    if (!gameState) {
        res.status(404).send(`Room ${roomId} does not exist`);
        return;
    }

    if (!gameState.isStarted) {
        await mutateGameState(roomId, (state) => {
            state.eventLog.logEvent('Game has started');
            state.isStarted = true;
            state.turnPlayer = state.players[Math.floor(Math.random() * state.players.length)].name
        });
    }

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
        res.status(404).send(`Room ${roomId} does not exist`);
        return;
    }

    const existingPlayer = gameState.players.find((player) => player.id === playerId);

    if (existingPlayer) {
        if (existingPlayer.name.toUpperCase() !== playerName.toUpperCase()) {
            res.status(400).send(`Previously joined Room ${roomId} as ${existingPlayer.name}`);
            return;
        }
    } else {
        if (gameState.players.length >= 6) {
            res.status(400).send(`Room ${roomId} is full`);
            return;
        }

        if (gameState.isStarted) {
            res.status(400).send(`Room ${roomId} is already playing`);
            return;
        }

        if (gameState.players.some((existingPlayer) =>
            existingPlayer.name.toUpperCase() === playerName.toUpperCase()
        )) {
            res.status(400).send(`Room ${roomId} already has player named ${playerName}`);
            return;
        }

        await addPlayerToGame(roomId, playerId, playerName);
    }

    res.status(200).send();
})

app.post('/action', async (req, res) => {
    const roomId = req.body?.roomId;
    const playerId = req.body?.playerId;
    const action = req.body?.action;
    const targetPlayer = req.body?.targetPlayer;

    if (!roomId || !playerId || !action) {
        res.status(400).send('roomId, playerId, and action are required');
        return;
    }

    const gameState = await getGameState(roomId);

    if (!gameState) {
        res.status(400).send(`Room ${roomId} does not exist`);
        return;
    }

    const player = gameState.players.find(({ id }) => id === playerId)

    if (!player) {
        res.status(400).send('Player not in room');
        return;
    }

    if (gameState.turnPlayer !== player.name
        || gameState.pendingAction
        || gameState.pendingActionChallenge
        || gameState.pendingBlock
        || gameState.pendingBlockChallenge) {
        res.status(400).send('You can\'t do that right now');
        return;
    }

    // validate target player

    await mutateGameState(roomId, (state) => {
        state.pendingAction = {
            action: action,
            passedPlayers: [],
            targetPlayer: targetPlayer
        }
    })

    res.status(200).send();
});

app.post('/actionResponse', async (req, res) => {
    const roomId = req.body?.roomId;
    const playerId = req.body?.playerId;
    const action = req.body?.action;
    const targetPlayer = req.body?.targetPlayer;

    if (!roomId || !playerId || !action) {
        res.status(400).send('roomId, playerId, and response are required');
        return;
    }

    const gameState = await getGameState(roomId);

    if (!gameState) {
        res.status(400).send(`Room ${roomId} does not exist`);
        return;
    }

    const player = gameState.players.find(({ id }) => id === playerId)

    if (!player) {
        res.status(400).send('Player not in room');
        return;
    }

    if (gameState.turnPlayer !== player.name
        || gameState.pendingAction
        || gameState.pendingActionChallenge
        || gameState.pendingBlock
        || gameState.pendingBlockChallenge) {
        res.status(400).send('You can\'t do that right now');
        return;
    }

    // validate target player

    await mutateGameState(roomId, (state) => {
        state.pendingAction = {
            action: action,
            passedPlayers: [],
            targetPlayer: targetPlayer
        }
    })

    res.status(200).send();
});

server.listen(process.env.PORT || port, function () {
    console.log(`listening on ${process.env.PORT || port}`);
});
