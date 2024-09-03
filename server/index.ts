import http from 'http';
import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import { addPlayerToGame, createNewGame, drawCardFromDeck, getGameState, getNextPlayerTurn, getPublicGameState, logEvent, mutateGameState, shuffleDeck } from './utilities/gameState';
import { generateRoomId } from './utilities/identifiers';
import { ActionAttributes, Actions, InfluenceAttributes, Influences, Responses } from '../shared/types/game';

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

        if (Object.values(Influences).some((influence) => influence.toUpperCase() === playerName.toUpperCase())) {
            res.status(400).send(`You may not choose the name of an influence`);
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

    if (!player.influences) {
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
                state.pendingInfluenceLossCount[targetPlayer] = (state.pendingInfluenceLossCount[targetPlayer] ?? 0) + 1;
                state.turnPlayer = getNextPlayerTurn(state);
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
                    if (cur.influences && cur.name !== player.name) {
                        agg.push(cur.name)
                    }
                    return agg;
                }, []),
                targetPlayer
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

    if (!player.influences) {
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
                const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer);
                const targetPlayer = state.players.find(({ name }) => name === state.pendingAction.targetPlayer);
                if (state.pendingAction.action === Actions.Assassinate) {
                    actionPlayer.coins -= 3;
                    state.pendingInfluenceLossCount[targetPlayer.name] = (state.pendingInfluenceLossCount[targetPlayer.name] ?? 0) + 1;
                } else if (state.pendingAction.action === Actions.Exchange) {
                    actionPlayer.influences.push(drawCardFromDeck(state), drawCardFromDeck(state));
                    state.deck = shuffleDeck(state.deck);
                    state.pendingInfluenceLossCount[actionPlayer.name] = (state.pendingInfluenceLossCount[actionPlayer.name] ?? 0) + 2;
                } else if (state.pendingAction.action === Actions.ForeignAid) {
                    actionPlayer.coins += 2;
                } else if (state.pendingAction.action === Actions.Steal) {
                    const coinsAvailable = Math.min(2, targetPlayer.coins);
                    actionPlayer.coins += coinsAvailable;
                    targetPlayer.coins -= coinsAvailable;
                } else if (state.pendingAction.action === Actions.Tax) {
                    actionPlayer.coins += 3;
                }
                state.turnPlayer = getNextPlayerTurn(state);
                logEvent(state, `${actionPlayer.name} used ${state.pendingAction.action}${targetPlayer ? ` on ${targetPlayer.name}` : ''}`)
                delete state.pendingAction;
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
            logEvent(state, `${player.name} is blocking ${state.turnPlayer} as ${claimedInfluence}`)
        });
    }

    res.status(200).send();
});

app.post('/challengeResponse', async (req, res) => {
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

    if (!player.influences) {
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

    if (InfluenceAttributes[influence as Influences].legalAction === gameState.pendingAction.action) {
        await mutateGameState(roomId, (state) => {
            const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer);
            const targetPlayer = state.players.find(({ name }) => name === state.pendingAction.targetPlayer);
            const challengePlayer = state.players.find(({ name }) => name === state.pendingActionChallenge.sourcePlayer);
            if (state.pendingAction.action === Actions.Assassinate) {
                actionPlayer.coins -= 3;
                state.pendingInfluenceLossCount[targetPlayer.name] = (state.pendingInfluenceLossCount[targetPlayer.name] ?? 0) + 1;
            } else if (state.pendingAction.action === Actions.Exchange) {
                actionPlayer.influences.push(drawCardFromDeck(state), drawCardFromDeck(state));
                state.deck = shuffleDeck(state.deck);
                state.pendingInfluenceLossCount[actionPlayer.name] = (state.pendingInfluenceLossCount[actionPlayer.name] ?? 0) + 2;
            } else if (state.pendingAction.action === Actions.ForeignAid) {
                actionPlayer.coins += 2;
            } else if (state.pendingAction.action === Actions.Steal) {
                const coinsAvailable = Math.min(2, targetPlayer.coins);
                actionPlayer.coins += coinsAvailable;
                targetPlayer.coins -= coinsAvailable;
            } else if (state.pendingAction.action === Actions.Tax) {
                actionPlayer.coins += 3;
            }
            state.pendingInfluenceLossCount[challengePlayer.name] = (state.pendingInfluenceLossCount[challengePlayer.name] ?? 0) + 1;
            logEvent(state, `${challengePlayer.name} failed to challenge ${state.turnPlayer}`)
            actionPlayer.influences.splice(
                actionPlayer.influences.findIndex((i) => i === influence),
                1
            );
            actionPlayer.influences.push(drawCardFromDeck(state));
            state.turnPlayer = getNextPlayerTurn(state);
            logEvent(state, `${actionPlayer.name} used ${state.pendingAction.action}${targetPlayer ? ` on ${targetPlayer.name}` : ''}`)
            delete state.pendingActionChallenge;
            delete state.pendingAction;
        });
    } else {
        await mutateGameState(roomId, (state) => {
            const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer);
            const challengePlayer = state.players.find(({ name }) => name === state.pendingActionChallenge.sourcePlayer);
            state.pendingInfluenceLossCount[actionPlayer.name] = (state.pendingInfluenceLossCount[actionPlayer.name] ?? 0) + 1;
            logEvent(state, `${challengePlayer.name} successfully challenged ${state.turnPlayer}`)
            state.turnPlayer = getNextPlayerTurn(state);
            delete state.pendingActionChallenge;
            delete state.pendingAction;
        });
    }

    res.status(200).send();
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

    if (!player.influences) {
        res.status(400).send('You had your chance');
        return;
    }

    if (!gameState.pendingInfluenceLossCount[player.name]) {
        res.status(400).send('You can\'t lose influence right now');
        return;
    }

    if (!Object.values(Influences).includes(influence)) {
        res.status(400).send('Unknown influence');
        return;
    }

    await mutateGameState(roomId, (state) => {
        const sadPlayer = state.players.find(({ id }) => id === player.id);
        const currentCount = state.pendingInfluenceLossCount[sadPlayer.name];
        if (currentCount === 1) {
            delete state.pendingInfluenceLossCount[sadPlayer.name];
        } else {
            state.pendingInfluenceLossCount[sadPlayer.name] = currentCount - 1;
        }
        sadPlayer.influences.splice(
            sadPlayer.influences.findIndex((i) => i === influence),
            1
        );
        logEvent(state, `${player.name} lost their ${influence}`)
    });

    res.status(200).send();
});

server.listen(process.env.PORT || port, function () {
    console.log(`listening on ${process.env.PORT || port}`);
});
