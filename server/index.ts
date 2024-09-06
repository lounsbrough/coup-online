import http from 'http';
import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import { addPlayerToGame, createNewGame, drawCardFromDeck, getGameState, getNextPlayerTurn, getPublicGameState, killPlayerInfluence, logEvent, mutateGameState, processPendingAction, resetGame, shuffle, startGame } from './utilities/gameState';
import { generateRoomId } from './utilities/identifiers';
import { ActionAttributes, Actions, InfluenceAttributes, Influences, Responses } from '../shared/types/game';

const port = process.env.EXPRESS_PORT || 8000;

const app = express();
app.use(cors());
app.use(json());
const server = http.createServer(app);

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

    if (playerName.length > 10) {
        res.status(400).send('playerName must be 10 characters or less');
        return;
    }

    if (Object.values(Influences).some((influence) => influence.toUpperCase() === playerName.toUpperCase())) {
        res.status(400).send(`You may not choose the name of an influence`);
        return;
    }

    if (Object.values(Actions).some((action) => action.toUpperCase() === playerName.toUpperCase())) {
        res.status(400).send(`You may not choose the name of an action`);
        return;
    }

    const roomId = generateRoomId();

    await createNewGame(roomId);
    await addPlayerToGame(roomId, playerId, playerName);

    res.status(200).json(await getPublicGameState(roomId, playerId));
});

app.post('/resetGame', async (req, res) => {
    const roomId = req.body?.roomId;
    const playerId = req.body?.playerId;

    if (!roomId || !playerId) {
        res.status(400).send('roomId and playerId are required');
        return;
    }

    const gameState = await getGameState(roomId);

    if (!gameState) {
        res.status(404).send(`Room ${roomId} does not exist`);
        return;
    }

    const player = gameState.players.find(({ id }) => id === playerId)

    if (!player) {
        res.status(400).send('Player not in game');
        return;
    }

    if (gameState.players.filter(({ influences }) => influences.length).length > 1) {
        res.status(400).send('Current game is not over');
        return;
    }

    await resetGame(roomId);
    await startGame(roomId);

    res.status(200).json(await getPublicGameState(roomId, playerId));
});

app.post('/startGame', async (req, res) => {
    const roomId = req.body?.roomId;
    const playerId = req.body?.playerId;

    if (!roomId || !playerId) {
        res.status(400).send('roomId and playerId are required');
        return;
    }

    const gameState = await getGameState(roomId);

    if (!gameState) {
        res.status(404).send(`Room ${roomId} does not exist`);
        return;
    }

    const player = gameState.players.find(({ id }) => id === playerId)

    if (!player) {
        res.status(400).send('Player not in game');
        return;
    }

    if (!gameState.isStarted) {
        await startGame(roomId);
    }

    res.status(200).json(await getPublicGameState(roomId, playerId));
})

app.post('/joinGame', async (req, res) => {
    const roomId = req.body?.roomId;
    const playerId = req.body?.playerId;
    const playerName = req.body?.playerName?.trim();

    if (!roomId || !playerId || !playerName) {
        res.status(400).send('roomId, playerId, and playerName are required');
        return;
    }

    if (playerName.length > 10) {
        res.status(400).send('playerName must be 10 characters or less');
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

        if (Object.values(Influences).some((influence) => influence.toUpperCase() === playerName.toUpperCase())) {
            res.status(400).send(`You may not choose the name of an influence`);
            return;
        }

        if (Object.values(Actions).some((action) => action.toUpperCase() === playerName.toUpperCase())) {
            res.status(400).send(`You may not choose the name of an action`);
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

    res.status(200).json(await getPublicGameState(roomId, playerId));
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

    if (!Object.values(Actions).includes(action)) {
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
        res.status(400).send('Player not in game');
        return;
    }

    if (!player.influences.length) {
        res.status(400).send('You had your chance');
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

    if (player.coins >= 10 && action !== Actions.Coup) {
        res.status(400).send('You must coup when you have 10 or more coins');
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
                state.players.find(({ id }) => id === playerId).coins -= 7;
                killPlayerInfluence(state, targetPlayer);
                logEvent(state, `${player.name} used ${action} on ${targetPlayer}`)
            });
        } else if (action === Actions.Income) {
            await mutateGameState(roomId, (state) => {
                state.players.find(({ id }) => id === playerId).coins += 1;
                state.turnPlayer = getNextPlayerTurn(state);
                logEvent(state, `${player.name} used ${action}`)
            });
        }
    } else {
        await mutateGameState(roomId, (state) => {
            state.pendingAction = {
                action: action,
                pendingPlayers: state.players.reduce((agg: string[], cur) => {
                    if (cur.influences.length && cur.name !== player.name) {
                        agg.push(cur.name)
                    }
                    return agg;
                }, []),
                targetPlayer
            }
            logEvent(state, `${player.name} is trying to use ${action}${targetPlayer ? ` on ${targetPlayer}` : ''}`)
        });
    }

    res.status(200).json(await getPublicGameState(roomId, playerId));
});

app.post('/actionResponse', async (req, res) => {
    const roomId = req.body?.roomId;
    const playerId = req.body?.playerId;
    const response = req.body?.response;
    const claimedInfluence = req.body?.claimedInfluence;

    if (!roomId || !playerId || !response) {
        res.status(400).send('roomId, playerId, and response are required');
        return;
    }

    const gameState = await getGameState(roomId);

    if (!gameState) {
        res.status(400).send(`Room ${roomId} does not exist`);
        return;
    }

    const player = gameState.players.find(({ id }) => id === playerId);

    if (!player) {
        res.status(400).send('Player not in room');
        return;
    }

    if (!player.influences.length) {
        res.status(400).send('You had your chance');
        return;
    }

    if (!gameState.pendingAction
        || gameState.pendingActionChallenge
        || !gameState.pendingAction.pendingPlayers.includes(player.name)) {
        res.status(400).send('You can\'t choose an action response right now');
        return;
    }

    if (!Object.values(Responses).includes(response)) {
        res.status(400).send('Unknown response');
        return;
    }

    if (response === Responses.Pass) {
        if (gameState.pendingAction.pendingPlayers.length === 1) {
            await mutateGameState(roomId, (state) => {
                processPendingAction(state);
            });
        } else {
            await mutateGameState(roomId, (state) => {
                state.pendingAction.pendingPlayers.splice(
                    state.pendingAction.pendingPlayers.findIndex((pendingPlayer) => pendingPlayer === player.name),
                    1
                );
            });
        }
    } else if (response === Responses.Challenge) {
        await mutateGameState(roomId, (state) => {
            state.pendingAction.pendingPlayers = [];
            state.pendingActionChallenge = {
                sourcePlayer: player.name
            }
            logEvent(state, `${player.name} is challenging ${state.turnPlayer}`)
        });
    } else if (response === Responses.Block) {
        if (!claimedInfluence) {
            res.status(400).send('claimedInfluence is required when blocking');
            return;
        }

        if (!Object.values(Influences).includes(claimedInfluence)) {
            res.status(400).send('Unknown claimedInfluence');
            return;
        }

        await mutateGameState(roomId, (state) => {
            state.pendingAction.pendingPlayers = [];
            state.pendingBlock = {
                sourcePlayer: player.name,
                claimedInfluence
            }
            logEvent(state, `${player.name} is trying to block ${state.turnPlayer} as ${claimedInfluence}`)
        });
    }

    res.status(200).json(await getPublicGameState(roomId, playerId));
});

app.post('/actionChallengeResponse', async (req, res) => {
    const roomId = req.body?.roomId;
    const playerId = req.body?.playerId;
    const influence = req.body?.influence;

    if (!roomId || !playerId || !influence) {
        res.status(400).send('roomId, playerId, and influence are required');
        return;
    }

    const gameState = await getGameState(roomId);

    if (!gameState) {
        res.status(400).send(`Room ${roomId} does not exist`);
        return;
    }

    const player = gameState.players.find(({ id }) => id === playerId);

    if (!player) {
        res.status(400).send('Player not in room');
        return;
    }

    if (!player.influences.length) {
        res.status(400).send('You had your chance');
        return;
    }

    if (!gameState.pendingActionChallenge) {
        res.status(400).send('You can\'t choose a challenge response right now');
        return;
    }

    if (!Object.values(Influences).includes(influence)) {
        res.status(400).send('Unknown influence');
        return;
    }

    if (!player.influences.includes(influence)) {
        res.status(400).send('You don\'t have that influence');
        return;
    }

    if (InfluenceAttributes[influence as Influences].legalAction === gameState.pendingAction.action) {
        await mutateGameState(roomId, (state) => {
            const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer);
            const challengePlayer = state.players.find(({ name }) => name === state.pendingActionChallenge.sourcePlayer);
            killPlayerInfluence(state, challengePlayer.name);
            logEvent(state, `${actionPlayer.name} revealed and replaced ${influence}`);
            logEvent(state, `${challengePlayer.name} failed to challenge ${state.turnPlayer}`);
            state.deck.push(actionPlayer.influences.splice(
                actionPlayer.influences.findIndex((i) => i === influence),
                1
            )[0]);
            state.deck = shuffle(state.deck);
            actionPlayer.influences.push(drawCardFromDeck(state));
            delete state.pendingActionChallenge;
            processPendingAction(state);
        });
    } else {
        await mutateGameState(roomId, (state) => {
            const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer);
            const challengePlayer = state.players.find(({ name }) => name === state.pendingActionChallenge.sourcePlayer);
            killPlayerInfluence(state, actionPlayer.name);
            logEvent(state, `${challengePlayer.name} successfully challenged ${state.turnPlayer}`)
            delete state.pendingActionChallenge;
            delete state.pendingAction;
        });
    }

    res.status(200).json(await getPublicGameState(roomId, playerId));
});

app.post('/blockResponse', async (req, res) => {
    const roomId = req.body?.roomId;
    const playerId = req.body?.playerId;
    const response = req.body?.response;

    if (!roomId || !playerId || !response) {
        res.status(400).send('roomId, playerId, and response are required');
        return;
    }

    const gameState = await getGameState(roomId);

    if (!gameState) {
        res.status(400).send(`Room ${roomId} does not exist`);
        return;
    }

    const player = gameState.players.find(({ id }) => id === playerId);

    if (!player) {
        res.status(400).send('Player not in room');
        return;
    }

    if (!player.influences.length) {
        res.status(400).send('You had your chance');
        return;
    }

    if (!gameState.pendingBlock) {
        res.status(400).send('You can\'t choose a block response right now');
        return;
    }

    if (!Object.values(Responses).includes(response)) {
        res.status(400).send('Unknown response');
        return;
    }

    if (response === Responses.Block) {
        res.status(400).send('You can\t block a block');
        return;
    }

    if (response === Responses.Challenge) {
        await mutateGameState(roomId, (state) => {
            const blockPlayer = state.players.find(({ name }) => name === state.pendingBlock.sourcePlayer);
            logEvent(state, `${player.name} is challenging ${blockPlayer.name}`)
            state.pendingBlockChallenge = { sourcePlayer: player.name }
        });
    } else if (response === Responses.Pass) {
        await mutateGameState(roomId, (state) => {
            const blockPlayer = state.players.find(({ name }) => name === state.pendingBlock.sourcePlayer);
            logEvent(state, `${blockPlayer.name} successfully blocked ${state.turnPlayer}`)
            state.turnPlayer = getNextPlayerTurn(state);
            delete state.pendingBlock;
            delete state.pendingActionChallenge;
            delete state.pendingAction;
        });
    }

    res.status(200).json(await getPublicGameState(roomId, playerId));
});

app.post('/blockChallengeResponse', async (req, res) => {
    const roomId = req.body?.roomId;
    const playerId = req.body?.playerId;
    const influence = req.body?.influence;

    if (!roomId || !playerId || !influence) {
        res.status(400).send('roomId, playerId, and influence are required');
        return;
    }

    const gameState = await getGameState(roomId);

    if (!gameState) {
        res.status(400).send(`Room ${roomId} does not exist`);
        return;
    }

    const player = gameState.players.find(({ id }) => id === playerId);

    if (!player) {
        res.status(400).send('Player not in room');
        return;
    }

    if (!player.influences.length) {
        res.status(400).send('You had your chance');
        return;
    }

    if (!gameState.pendingBlockChallenge) {
        res.status(400).send('You can\'t choose a challenge response right now');
        return;
    }

    if (!Object.values(Influences).includes(influence)) {
        res.status(400).send('Unknown influence');
        return;
    }

    if (!player.influences.includes(influence)) {
        res.status(400).send('You don\'t have that influence');
        return;
    }

    if (InfluenceAttributes[influence as Influences].legalBlock === gameState.pendingAction.action) {
        await mutateGameState(roomId, (state) => {
            const challengePlayer = state.players.find(({ name }) => name === state.pendingBlockChallenge.sourcePlayer);
            const blockPlayer = state.players.find(({ name }) => name === state.pendingBlock.sourcePlayer);
            killPlayerInfluence(state, challengePlayer.name);
            state.deck.push(blockPlayer.influences.splice(
                blockPlayer.influences.findIndex((i) => i === influence),
                1
            )[0]);
            state.deck = shuffle(state.deck);
            blockPlayer.influences.push(drawCardFromDeck(state));
            logEvent(state, `${blockPlayer.name} revealed and replaced ${influence}`);
            logEvent(state, `${blockPlayer.name} successfully blocked ${state.turnPlayer}`);
            delete state.pendingBlockChallenge;
            delete state.pendingBlock;
            delete state.pendingActionChallenge;
            delete state.pendingAction;
        });
    } else {
        await mutateGameState(roomId, (state) => {
            const blockPlayer = state.players.find(({ name }) => name === state.pendingBlock.sourcePlayer);
            killPlayerInfluence(state, blockPlayer.name);
            logEvent(state, `${blockPlayer.name} failed to block ${state.turnPlayer}`)
            processPendingAction(state);
            delete state.pendingBlockChallenge;
            delete state.pendingBlock;
            delete state.pendingActionChallenge;
            delete state.pendingAction;
        });
    }

    res.status(200).json(await getPublicGameState(roomId, playerId));
});

app.post('/loseInfluence', async (req, res) => {
    const roomId = req.body?.roomId;
    const playerId = req.body?.playerId;
    const influence = req.body?.influence;

    if (!roomId || !playerId || !influence) {
        res.status(400).send('roomId, playerId, and influence are required');
        return;
    }

    const gameState = await getGameState(roomId);

    if (!gameState) {
        res.status(400).send(`Room ${roomId} does not exist`);
        return;
    }

    const player = gameState.players.find(({ id }) => id === playerId);

    if (!player) {
        res.status(400).send('Player not in room');
        return;
    }

    if (!player.influences.length) {
        res.status(400).send('You had your chance');
        return;
    }

    if (!gameState.pendingInfluenceLoss[player.name]) {
        res.status(400).send('You can\'t lose influence right now');
        return;
    }

    if (!Object.values(Influences).includes(influence)) {
        res.status(400).send('Unknown influence');
        return;
    }

    await mutateGameState(roomId, (state) => {
        const sadPlayer = state.players.find(({ id }) => id === player.id);

        const removedInfluence = sadPlayer.influences.splice(
            sadPlayer.influences.findIndex((i) => i === influence),
            1
        )[0];

        if (state.pendingInfluenceLoss[sadPlayer.name][0].putBackInDeck) {
            state.deck.unshift(removedInfluence);
        } else {
            logEvent(state, `${player.name} lost their ${influence}`);
        }

        if (state.pendingInfluenceLoss[sadPlayer.name].length > 1) {
            state.pendingInfluenceLoss[sadPlayer.name].splice(0, 1);
        } else {
            delete state.pendingInfluenceLoss[sadPlayer.name];
        }

        if (!Object.keys(state.pendingInfluenceLoss).length) {
            state.turnPlayer = getNextPlayerTurn(state);
        }

        if (!sadPlayer.influences.length) {
            logEvent(state, `${sadPlayer.name} is out!`);
            delete state.pendingInfluenceLoss[sadPlayer.name];
        }
    });

    res.status(200).json(await getPublicGameState(roomId, playerId));
});

server.listen(port, function () {
    console.log(`listening on ${port}`);
});
