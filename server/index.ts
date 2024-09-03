import http from 'http';
import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import { addPlayerToGame, createNewGame, getGameState, getNextPlayerTurn, getPublicGameState, logEvent, mutateGameState } from './utilities/gameState';
import { generateRoomId } from './utilities/identifiers';
import { ActionAttributes, Actions } from '../shared/types/game';

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
            state.isStarted = true;
            state.turnPlayer = state.players[Math.floor(Math.random() * state.players.length)].name
            logEvent(state, 'Game has started');
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
    const action = req.body?.action as Actions;
    const targetPlayer = req.body?.targetPlayer;

    if (!roomId || !playerId || !action) {
        res.status(400).send('roomId, playerId, and action are required');
        return;
    }

    if (!(action in Actions)) {
        res.status(400).send('Unknown action');
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
        res.status(400).send('You can\'t choose an action right now');
        return;
    }

    if ((ActionAttributes[action].coinsRequired ?? 0) > player.coins) {
        res.status(400).send('You don\'t have enough coins');
        return;
    }

    if (targetPlayer && !gameState.players.some((player) => player.name === targetPlayer)) {
        res.status(400).send('Unknown target player');
        return;
    }

    if (ActionAttributes[action].requiresTarget && !targetPlayer) {
        res.status(400).send('Target player is required for this action');
        return;
    }

    if (!ActionAttributes[action].requiresTarget && targetPlayer) {
        res.status(400).send('Target player is not allowed for this action');
        return;
    }

    if (!ActionAttributes[action].blockable && !ActionAttributes[action].challengeable) {
        if (action === Actions.Coup) {
            await mutateGameState(roomId, (state) => {
                state.players.find((player) => player.id === playerId).coins -= 7;
                state.pendingInfluenceLossCount[targetPlayer] = (state.pendingInfluenceLossCount[targetPlayer] ?? 0) + 1;
                state.turnPlayer = getNextPlayerTurn(state);
                logEvent(state, `${player.name} used ${action} on ${targetPlayer}`)
            });
        } else if (action === Actions.Income) {
            await mutateGameState(roomId, (state) => {
                state.players.find((player) => player.id === playerId).coins += 1;
                state.turnPlayer = getNextPlayerTurn(state);
                logEvent(state, `${player.name} used ${action}`)
            });
        }
    } else {
        await mutateGameState(roomId, (state) => {
            state.pendingAction = {
                action: action,
                passedPlayers: [],
                targetPlayer: targetPlayer
            }
            logEvent(state, `${player.name} is trying to use ${action}${targetPlayer ? ` on ${targetPlayer}` : ''}`)
        });
    }

    res.status(200).send();
});

app.post('/actionResponse', async (req, res) => {
    const roomId = req.body?.roomId;
    const playerId = req.body?.playerId;
    const response = req.body?.response;

    if (!roomId || !playerId || !response) {
        res.status(400).send('roomId, playerId, and response are required');
        return;
    }

    // TODO

    res.status(200).send();
});

server.listen(process.env.PORT || port, function () {
    console.log(`listening on ${process.env.PORT || port}`);
});
