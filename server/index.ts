import http from 'http'
import express, { NextFunction, Request, Response } from 'express'
import { json } from 'body-parser'
import cors from 'cors'
import Joi, { ObjectSchema } from 'joi'
import { drawCardFromDeck, getGameState, getPublicGameState, logEvent, mutateGameState, shuffleDeck } from './src/utilities/gameState'
import { generateRoomId } from './src/utilities/identifiers'
import { ActionAttributes, Actions, InfluenceAttributes, Influences, Responses, PublicGameState, GameState } from '../shared/types/game'
import { createNewGame, addPlayerToGame, resetGame, startGame, promptPlayerToLoseInfluence, moveTurnToNextPlayer, processPendingAction, killPlayerInfluence } from './src/game/logic'

const port = process.env.EXPRESS_PORT || 8008

const app = express()
app.use(cors())
app.use(json())
const server = http.createServer(app)

type PublicGameStateOrError = PublicGameState | {
    error: string
}

const playerNameRule = Joi.string().min(1).max(10).disallow(
    ...Object.values(Influences),
    ...Object.values(Actions)
).required()

const validateRequest = (schema: ObjectSchema, requestProperty: 'body' | 'query') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.validate(req[requestProperty], { abortEarly: false })
        if (result.error) {
            res.status(400).json({
                error: result.error.details.map(({ message }) => message).join(', '),
            })
            return
        }
        next()
    }
}
const validateBody = (schema: ObjectSchema) => validateRequest(schema, 'body')
const validateQuery = (schema: ObjectSchema) => validateRequest(schema, 'query')

const validateRoomId = (res: Response, gameState: GameState, roomId: string) => {
    if (!gameState) {
        res.status(404).json({ error: `Room ${roomId} does not exist` })
        return false
    }

    return true
}

const validateRoomIdAndPlayerId = (res: Response, gameState: GameState, roomId: string, playerId: string) => {
    if (!validateRoomId(res, gameState, roomId)) {
        return false
    }

    const player = gameState.players.find(({ id }) => id === playerId)

    if (!player) {
        res.status(400).json({ error: 'Player not in game' })
        return false
    }

    return true
}

app.get('/gameState', validateQuery(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required()
})), (async (
    req: Request,
    res: Response<PublicGameStateOrError>
) => {
    const roomId: string = req.query.roomId as string
    const playerId: string = req.query.playerId as string

    const gameState = await getGameState(roomId)

    if (!validateRoomIdAndPlayerId(res, gameState, roomId, playerId)) {
        return
    }

    res.status(200).json(await getPublicGameState(roomId, playerId))
}))

app.post('/createGame', validateBody(Joi.object().keys({
    playerId: Joi.string().required(),
    playerName: playerNameRule
})), async (
    req: Request,
    res: Response<PublicGameStateOrError>
) => {
    const playerId: string = req.body.playerId
    const playerName: string = req.body.playerName

    const roomId = generateRoomId()

    await createNewGame(roomId, playerId, playerName)

    res.status(200).json(await getPublicGameState(roomId, playerId))
})

app.post('/joinGame', validateBody(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required(),
    playerName: playerNameRule
})), async (
    req: Request,
    res: Response<PublicGameStateOrError>
) => {
    const roomId: string = req.body.roomId
    const playerId: string = req.body.playerId
    const playerName: string = req.body.playerName.trim()

    const gameState = await getGameState(roomId)

    if (!validateRoomId(res, gameState, roomId)) {
        return
    }

    const existingPlayer = gameState.players.find((player) => player.id === playerId)

    if (existingPlayer) {
        if (existingPlayer.name.toUpperCase() !== playerName.toUpperCase()) {
            res.status(400).json({ error: `Previously joined Room ${roomId} as ${existingPlayer.name}` })
            return
        }
    } else {
        if (gameState.players.length >= 6) {
            res.status(400).json({ error: `Room ${roomId} is full` })
            return
        }

        if (gameState.isStarted) {
            res.status(400).json({ error: 'Game has already started' })
            return
        }

        if (gameState.players.some((existingPlayer) =>
            existingPlayer.name.toUpperCase() === playerName.toUpperCase()
        )) {
            res.status(400).json({ error: `Room ${roomId} already has player named ${playerName}` })
            return
        }

        await mutateGameState(roomId, (state) => {
            addPlayerToGame(state, playerId, playerName)
        })
    }

    res.status(200).json(await getPublicGameState(roomId, playerId))
})

app.post('/resetGame', validateBody(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required()
})), async (
    req: Request,
    res: Response<PublicGameStateOrError>
) => {
    const roomId: string = req.body.roomId
    const playerId: string = req.body.playerId

    const gameState = await getGameState(roomId)

    if (!validateRoomIdAndPlayerId(res, gameState, roomId, playerId)) {
        return
    }

    if (gameState.isStarted && gameState.players.filter(({ influences }) => influences.length).length > 1) {
        res.status(400).json({ error: 'Current game is in progress' })
        return
    }

    await resetGame(roomId)

    res.status(200).json(await getPublicGameState(roomId, playerId))
})

app.post('/startGame', validateBody(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required()
})), async (
    req: Request,
    res: Response<PublicGameStateOrError>
) => {
    const roomId: string = req.body.roomId
    const playerId: string = req.body.playerId

    const gameState = await getGameState(roomId)

    if (!validateRoomIdAndPlayerId(res, gameState, roomId, playerId)) {
        return
    }

    if (gameState.players.length < 2) {
        res.status(400).json({ error: 'Game must have at least 2 players to start' })
        return
    }

    if (gameState.isStarted) {
        res.status(400).json({ error: 'Game has already started' })
        return
    }

    await startGame(roomId)

    res.status(200).json(await getPublicGameState(roomId, playerId))
})

app.post('/action', validateBody(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required(),
    action: Joi.string().allow(...Object.values(Actions)).required(),
    targetPlayer: Joi.string()
})), async (
    req: Request,
    res: Response<PublicGameStateOrError>
) => {
    const roomId: string = req.body.roomId
    const playerId: string = req.body.playerId
    const action: Actions = req.body.action
    const targetPlayer: string | undefined = req.body.targetPlayer

    const gameState = await getGameState(roomId)

    if (!validateRoomIdAndPlayerId(res, gameState, roomId, playerId)) {
        return
    }

    const player = gameState.players.find(({ id }) => id === playerId)

    if (!player.influences.length) {
        res.status(400).json({ error: 'You had your chance' })
        return
    }

    if (gameState.turnPlayer !== player.name
        || gameState.pendingAction
        || gameState.pendingActionChallenge
        || gameState.pendingBlock
        || gameState.pendingBlockChallenge) {
        res.status(400).json({ error: 'You can\'t choose an action right now' })
        return
    }

    if ((ActionAttributes[action].coinsRequired ?? 0) > player.coins) {
        res.status(400).json({ error: 'You don\'t have enough coins' })
        return
    }

    if (player.coins >= 10 && action !== Actions.Coup) {
        res.status(400).json({ error: 'You must coup when you have 10 or more coins' })
        return
    }

    if (targetPlayer && !gameState.players.some((player) => player.name === targetPlayer)) {
        res.status(400).json({ error: 'Unknown target player' })
        return
    }

    if (ActionAttributes[action].requiresTarget && !targetPlayer) {
        res.status(400).json({ error: 'Target player is required for this action' })
        return
    }

    if (!ActionAttributes[action].requiresTarget && targetPlayer) {
        res.status(400).json({ error: 'Target player is not allowed for this action' })
        return
    }

    if (!ActionAttributes[action].blockable && !ActionAttributes[action].challengeable) {
        if (action === Actions.Coup) {
            await mutateGameState(roomId, (state) => {
                state.players.find(({ id }) => id === playerId).coins -= ActionAttributes.Coup.coinsRequired
                promptPlayerToLoseInfluence(state, targetPlayer)
                logEvent(state, `${player.name} used ${action} on ${targetPlayer}`)
            })
        } else if (action === Actions.Income) {
            await mutateGameState(roomId, (state) => {
                state.players.find(({ id }) => id === playerId).coins += 1
                moveTurnToNextPlayer(state)
                logEvent(state, `${player.name} used ${action}`)
            })
        }
    } else {
        await mutateGameState(roomId, (state) => {
            state.pendingAction = {
                action: action,
                pendingPlayers: state.players.reduce((agg: string[], cur) => {
                    if (cur.influences.length && cur.name !== player.name) {
                        agg.push(cur.name)
                    }
                    return agg
                }, []),
                targetPlayer,
                claimConfirmed: false
            }
            logEvent(state, `${player.name} is trying to use ${action}${targetPlayer ? ` on ${targetPlayer}` : ''}`)
        })
    }

    res.status(200).json(await getPublicGameState(roomId, playerId))
})

app.post('/actionResponse', validateBody(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required(),
    response: Joi.string().allow(...Object.values(Responses)).required(),
    claimedInfluence: Joi.string().allow(...Object.values(Influences))
})), async (
    req: Request,
    res: Response<PublicGameStateOrError>
) => {
    const roomId: string = req.body.roomId
    const playerId: string = req.body.playerId
    const response: Responses = req.body.response
    const claimedInfluence: Influences | undefined = req.body.claimedInfluence

    const gameState = await getGameState(roomId)

    if (!validateRoomIdAndPlayerId(res, gameState, roomId, playerId)) {
        return
    }

    const player = gameState.players.find(({ id }) => id === playerId)

    if (!player.influences.length) {
        res.status(400).json({ error: 'You had your chance' })
        return
    }

    if (!gameState.pendingAction
        || gameState.pendingActionChallenge
        || !gameState.pendingAction.pendingPlayers.includes(player.name)) {
        res.status(400).json({ error: 'You can\'t choose an action response right now' })
        return
    }

    if (response === Responses.Pass) {
        await mutateGameState(roomId, (state) => {
            if (state.pendingAction.pendingPlayers.length === 1) {
                processPendingAction(state)
            } else {
                state.pendingAction.pendingPlayers.splice(
                    state.pendingAction.pendingPlayers.findIndex((pendingPlayer) => pendingPlayer === player.name),
                    1
                )
            }
        })
    } else if (response === Responses.Challenge) {
        if (gameState.pendingAction.claimConfirmed) {
            res.status(400).json({ error: `${gameState.turnPlayer} has already confirmed their claim` })
            return
        }

        await mutateGameState(roomId, (state) => {
            state.pendingActionChallenge = {
                sourcePlayer: player.name
            }
            logEvent(state, `${player.name} is challenging ${state.turnPlayer}`)
        })
    } else if (response === Responses.Block) {
        if (!claimedInfluence) {
            res.status(400).json({ error: 'claimedInfluence is required when blocking' })
            return
        }

        if (InfluenceAttributes[claimedInfluence as Influences].legalBlock !== gameState.pendingAction.action) {
            res.status(400).json({ error: 'claimedInfluence can not block this action' })
            return
        }

        if (gameState.pendingAction.targetPlayer &&
            player.name !== gameState.pendingAction.targetPlayer
        ) {
            res.status(400).json({ error: `You are not the target of the pending action` })
            return
        }

        await mutateGameState(roomId, (state) => {
            state.pendingAction.pendingPlayers = []
            state.pendingBlock = {
                sourcePlayer: player.name,
                claimedInfluence,
                pendingPlayers: state.players.reduce((agg: string[], cur) => {
                    if (cur.influences.length && cur.name !== player.name) {
                        agg.push(cur.name)
                    }
                    return agg
                }, []),
            }
            logEvent(state, `${player.name} is trying to block ${state.turnPlayer} as ${claimedInfluence}`)
        })
    }

    res.status(200).json(await getPublicGameState(roomId, playerId))
})

app.post('/actionChallengeResponse', validateBody(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required(),
    influence: Joi.string().allow(...Object.values(Influences)).required()
})), async (
    req: Request,
    res: Response<PublicGameStateOrError>
) => {
    const roomId: string = req.body.roomId
    const playerId: string = req.body.playerId
    const influence: Influences = req.body.influence

    const gameState = await getGameState(roomId)

    if (!validateRoomIdAndPlayerId(res, gameState, roomId, playerId)) {
        return
    }

    const player = gameState.players.find(({ id }) => id === playerId)

    if (!player.influences.length) {
        res.status(400).json({ error: 'You had your chance' })
        return
    }

    if (!gameState.pendingActionChallenge) {
        res.status(400).json({ error: 'You can\'t choose a challenge response right now' })
        return
    }

    if (!player.influences.includes(influence)) {
        res.status(400).json({ error: 'You don\'t have that influence' })
        return
    }

    if (InfluenceAttributes[influence as Influences].legalAction === gameState.pendingAction.action) {
        await mutateGameState(roomId, (state) => {
            const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer)
            const challengePlayer = state.players.find(({ name }) => name === state.pendingActionChallenge.sourcePlayer)
            promptPlayerToLoseInfluence(state, challengePlayer.name)
            logEvent(state, `${actionPlayer.name} revealed and replaced ${influence}`)
            logEvent(state, `${challengePlayer.name} failed to challenge ${state.turnPlayer}`)
            state.deck.push(actionPlayer.influences.splice(
                actionPlayer.influences.findIndex((i) => i === influence),
                1
            )[0])
            shuffleDeck(state)
            actionPlayer.influences.push(drawCardFromDeck(state))
            delete state.pendingActionChallenge
            state.pendingAction.claimConfirmed = true
            if (state.pendingAction.targetPlayer) {
                const targetPlayer = gameState.players.find(({ name }) => name === state.pendingAction.targetPlayer)
                if (targetPlayer.influences.length > (state.pendingInfluenceLoss[targetPlayer.name]?.length ?? 0)) {
                    state.pendingAction.pendingPlayers = [state.pendingAction.targetPlayer]
                } else {
                    processPendingAction(state)
                }
            } else if (ActionAttributes[state.pendingAction.action].blockable) {
                state.pendingAction.pendingPlayers = state.players.reduce((agg: string[], cur) => {
                    if (cur.influences.length && cur.name !== state.turnPlayer) {
                        agg.push(cur.name)
                    }
                    return agg
                }, [])
            } else {
                processPendingAction(state)
            }
        })
    } else {
        await mutateGameState(roomId, (state) => {
            const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer)
            const challengePlayer = state.players.find(({ name }) => name === state.pendingActionChallenge.sourcePlayer)
            logEvent(state, `${challengePlayer.name} successfully challenged ${state.turnPlayer}`)
            killPlayerInfluence(state, actionPlayer.name, influence)
            moveTurnToNextPlayer(state)
            delete state.pendingActionChallenge
            delete state.pendingAction
        })
    }

    res.status(200).json(await getPublicGameState(roomId, playerId))
})

app.post('/blockResponse', validateBody(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required(),
    response: Joi.string().allow(...Object.values(Responses)).required()
})), async (
    req: Request,
    res: Response<PublicGameStateOrError>
) => {
    const roomId: string = req.body.roomId
    const playerId: string = req.body.playerId
    const response: string = req.body.response

    const gameState = await getGameState(roomId)

    if (!validateRoomIdAndPlayerId(res, gameState, roomId, playerId)) {
        return
    }

    const player = gameState.players.find(({ id }) => id === playerId)

    if (!player.influences.length) {
        res.status(400).json({ error: 'You had your chance' })
        return
    }

    if (!gameState.pendingBlock
        || gameState.pendingBlockChallenge
        || !gameState.pendingBlock.pendingPlayers.includes(player.name)
    ) {
        res.status(400).json({ error: 'You can\'t choose a block response right now' })
        return
    }

    if (response === Responses.Block) {
        res.status(400).json({ error: 'You can\'t block a block' })
        return
    }

    if (response === Responses.Challenge) {
        await mutateGameState(roomId, (state) => {
            const blockPlayer = state.players.find(({ name }) => name === state.pendingBlock.sourcePlayer)
            logEvent(state, `${player.name} is challenging ${blockPlayer.name}`)
            state.pendingBlockChallenge = { sourcePlayer: player.name }
        })
    } else if (response === Responses.Pass) {
        await mutateGameState(roomId, (state) => {
            if (state.pendingBlock.pendingPlayers.length === 1) {
                const blockPlayer = state.players.find(({ name }) => name === state.pendingBlock.sourcePlayer)
                logEvent(state, `${blockPlayer.name} successfully blocked ${state.turnPlayer}`)
                if (state.pendingAction.action === Actions.Assassinate) {
                    state.players.find(({ name }) => name === state.turnPlayer).coins
                        -= ActionAttributes.Assassinate.coinsRequired
                }
                moveTurnToNextPlayer(state)
                delete state.pendingBlock
                delete state.pendingActionChallenge
                delete state.pendingAction
            } else {
                state.pendingBlock.pendingPlayers.splice(
                    state.pendingBlock.pendingPlayers.findIndex((pendingPlayer) => pendingPlayer === player.name),
                    1
                )
            }
        })
    }

    res.status(200).json(await getPublicGameState(roomId, playerId))
})

app.post('/blockChallengeResponse', validateBody(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required(),
    influence: Joi.string().allow(...Object.values(Influences)).required()
})), async (
    req: Request,
    res: Response<PublicGameStateOrError>
) => {
    const roomId = req.body.roomId
    const playerId = req.body.playerId
    const influence = req.body.influence

    const gameState = await getGameState(roomId)

    if (!validateRoomIdAndPlayerId(res, gameState, roomId, playerId)) {
        return
    }

    const player = gameState.players.find(({ id }) => id === playerId)

    if (!player.influences.length) {
        res.status(400).json({ error: 'You had your chance' })
        return
    }

    if (!gameState.pendingBlockChallenge) {
        res.status(400).json({ error: 'You can\'t choose a challenge response right now' })
        return
    }

    if (!player.influences.includes(influence)) {
        res.status(400).json({ error: 'You don\'t have that influence' })
        return
    }

    if (influence === gameState.pendingBlock.claimedInfluence) {
        await mutateGameState(roomId, (state) => {
            const challengePlayer = state.players.find(({ name }) => name === state.pendingBlockChallenge.sourcePlayer)
            const blockPlayer = state.players.find(({ name }) => name === state.pendingBlock.sourcePlayer)
            promptPlayerToLoseInfluence(state, challengePlayer.name)
            state.deck.push(blockPlayer.influences.splice(
                blockPlayer.influences.findIndex((i) => i === influence),
                1
            )[0])
            shuffleDeck(state)
            blockPlayer.influences.push(drawCardFromDeck(state))
            logEvent(state, `${blockPlayer.name} revealed and replaced ${influence}`)
            logEvent(state, `${blockPlayer.name} successfully blocked ${state.turnPlayer}`)
            if (state.pendingAction.action === Actions.Assassinate) {
                state.players.find(({ name }) => name === state.turnPlayer).coins
                    -= ActionAttributes.Assassinate.coinsRequired
            }
            delete state.pendingBlockChallenge
            delete state.pendingBlock
            delete state.pendingActionChallenge
            delete state.pendingAction
        })
    } else {
        await mutateGameState(roomId, (state) => {
            const blockPlayer = state.players.find(({ name }) => name === state.pendingBlock.sourcePlayer)
            logEvent(state, `${blockPlayer.name} failed to block ${state.turnPlayer}`)
            killPlayerInfluence(state, blockPlayer.name, influence)
            processPendingAction(state)
            delete state.pendingBlockChallenge
            delete state.pendingBlock
            delete state.pendingActionChallenge
            delete state.pendingAction
        })
    }

    res.status(200).json(await getPublicGameState(roomId, playerId))
})

app.post('/loseInfluence', validateBody(Joi.object().keys({
    roomId: Joi.string().required(),
    playerId: Joi.string().required(),
    influence: Joi.string().allow(...Object.values(Influences)).required()
})), async (
    req: Request,
    res: Response<PublicGameStateOrError>
) => {
    const roomId: string = req.body.roomId
    const playerId: string = req.body.playerId
    const influence: Influences = req.body.influence

    const gameState = await getGameState(roomId)

    if (!validateRoomIdAndPlayerId(res, gameState, roomId, playerId)) {
        return
    }

    const player = gameState.players.find(({ id }) => id === playerId)

    if (!player.influences.length) {
        res.status(400).json({ error: 'You had your chance' })
        return
    }

    if (!gameState.pendingInfluenceLoss[player.name]) {
        res.status(400).json({ error: 'You can\'t lose influence right now' })
        return
    }

    await mutateGameState(roomId, (state) => {
        const losingPlayer = state.players.find(({ id }) => id === playerId)
        if (state.pendingInfluenceLoss[losingPlayer.name][0].putBackInDeck) {
            const removedInfluence = losingPlayer.influences.splice(
                losingPlayer.influences.findIndex((i) => i === influence),
                1
            )[0]
            state.deck.unshift(removedInfluence)
        } else {
            killPlayerInfluence(state, losingPlayer.name, influence)
        }

        if (state.pendingInfluenceLoss[losingPlayer.name].length > 1) {
            state.pendingInfluenceLoss[losingPlayer.name].splice(0, 1)
        } else {
            delete state.pendingInfluenceLoss[losingPlayer.name]
        }

        if (!Object.keys(state.pendingInfluenceLoss).length && !state.pendingAction) {
            moveTurnToNextPlayer(state)
        }

        if (!losingPlayer.influences.length) {
            logEvent(state, `${losingPlayer.name} is out!`)
            delete state.pendingInfluenceLoss[losingPlayer.name]
        }
    })

    res.status(200).json(await getPublicGameState(roomId, playerId))
})

server.listen(port, function () {
    console.log(`listening on ${port}`)
})
