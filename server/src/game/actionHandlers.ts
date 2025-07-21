import crypto from 'crypto'
import { GameMutationInputError } from "../utilities/errors"
import { ActionAttributes, Actions, AiPersonality, EventMessages, GameSettings, GameState, InfluenceAttributes, Influences, Responses } from "../../../shared/types/game"
import { getGameState, getPublicGameState, logEvent, mutateGameState } from "../utilities/gameState"
import { generateRoomId } from "../utilities/identifiers"
import { addClaimedInfluence, addPlayerToGame, addUnclaimedInfluence, createNewGame, grudgeSizes, holdGrudge, humanOpponentsRemain, killPlayerInfluence, moveTurnToNextPlayer, processPendingAction, promptPlayerToLoseInfluence, removeClaimedInfluence, removePlayerFromGame, resetGame, revealAndReplaceInfluence, startGame } from "./logic"
import { canPlayerChooseAction, canPlayerChooseActionChallengeResponse, canPlayerChooseActionResponse, canPlayerChooseBlockChallengeResponse, canPlayerChooseBlockResponse } from '../../../shared/game/logic'
import { MAX_PLAYER_COUNT } from '../../../shared/helpers/playerCount'
import { decideAction, decideActionChallengeResponse, decideActionResponse, decideBlockChallengeResponse, decideBlockResponse, decideInfluencesToLose } from './ai'

const getPlayerInRoom = (gameState: GameState, playerId: string) => {
  const player = gameState.players.find(({ id }) => id === playerId)

  if (!player) {
    throw new GameMutationInputError('Player not in game')
  }

  return player
}

export const getGameStateHandler = async ({ roomId, playerId }: {
  roomId: string
  playerId: string
}) => {
  return { roomId, playerId }
}

export const createGameHandler = async ({ playerId, playerName, settings }: {
  playerId: string
  playerName: string
  settings: GameSettings
}) => {
  const roomId = generateRoomId()

  await createNewGame(roomId, playerId, playerName, settings)

  return { roomId, playerId }
}

export const joinGameHandler = async ({ roomId, playerId, playerName }: {
  roomId: string
  playerId: string
  playerName: string
}) => {
  const gameState = await getGameState(roomId)

  const player = gameState.players.find((player) => player.id === playerId)

  if (player) {
    if (player.name.toUpperCase() !== playerName.toUpperCase()) {
      await mutateGameState(gameState, (state) => {
        if (state.isStarted) {
          throw new GameMutationInputError(`You can join the game as "${player.name}"`)
        }

        const oldPlayer = state.players.find((player) => player.id === playerId)
        if (!oldPlayer) {
          throw new GameMutationInputError('Unable to find player')
        }
        state.players = [
          ...state.players.filter(({ id }) => id !== playerId),
          { ...oldPlayer, name: playerName }
        ]
      })
    }
  } else {
    await mutateGameState(gameState, (state) => {
      if (state.players.length >= MAX_PLAYER_COUNT) {
        throw new GameMutationInputError(`Room ${roomId} is full`)
      }

      if (state.isStarted) {
        throw new GameMutationInputError('Game has already started')
      }

      if (state.players.some((existingPlayer) =>
        existingPlayer.name.toUpperCase() === playerName.toUpperCase()
      )) {
        throw new GameMutationInputError(`Room ${roomId} already has player named ${playerName}`)
      }

      addPlayerToGame({ state, playerId, playerName })
    })
  }

  return { roomId, playerId }
}

export const addAiPlayerHandler = async ({ roomId, playerId, playerName, personality }: {
  roomId: string
  playerId: string
  playerName: string
  personality?: AiPersonality
}) => {
  const gameState = await getGameState(roomId)

  getPlayerInRoom(gameState, playerId)

  await mutateGameState(gameState, (state) => {
    if (state.players.length >= MAX_PLAYER_COUNT) {
      throw new GameMutationInputError(`Room ${roomId} is full`)
    }

    if (state.isStarted) {
      throw new GameMutationInputError('Game has already started')
    }

    if (state.players.some((existingPlayer) =>
      existingPlayer.name.toUpperCase() === playerName.toUpperCase()
    )) {
      throw new GameMutationInputError(`Room ${roomId} already has player named ${playerName}`)
    }

    addPlayerToGame({
      state,
      playerId: crypto.randomUUID(),
      playerName,
      ai: true,
      ...(personality && { personality })
    })
  })

  return { roomId, playerId }
}

export const removeFromGameHandler = async ({ roomId, playerId, playerName }: {
  roomId: string
  playerId: string
  playerName: string
}) => {
  const gameState = await getGameState(roomId)

  getPlayerInRoom(gameState, playerId)

  if (gameState.isStarted) {
    throw new GameMutationInputError('Game has already started')
  }

  const playerToRemove = gameState.players.find((player) => player.name === playerName)

  if (!playerToRemove) {
    throw new GameMutationInputError('Player is not in the room')
  }

  await mutateGameState(gameState, (state) => {
    removePlayerFromGame(state, playerName)
  })

  return { roomId, playerId }
}

export const resetGameRequestHandler = async ({ roomId, playerId }: {
  roomId: string
  playerId: string
}) => {
  const gameState = await getGameState(roomId)

  const player = getPlayerInRoom(gameState, playerId)

  const gameIsOver = gameState.players.filter(({ influences }) => influences.length).length === 1

  if (gameIsOver || !humanOpponentsRemain(gameState, player)) {
    await resetGame(roomId)
  } else {
    await mutateGameState(gameState, (state) => {
      if (state.isStarted && !state.resetGameRequest) {
        state.resetGameRequest = { player: player.name }
      }
    })
  }

  return { roomId, playerId }
}

export const resetGameRequestCancelHandler = async ({ roomId, playerId }: {
  roomId: string
  playerId: string
}) => {
  const gameState = await getGameState(roomId)

  getPlayerInRoom(gameState, playerId)

  await mutateGameState(gameState, (state) => {
    delete state.resetGameRequest
  })

  return { roomId, playerId }
}

export const resetGameHandler = async ({ roomId, playerId }: {
  roomId: string
  playerId: string
}) => {
  const gameState = await getGameState(roomId)

  const player = getPlayerInRoom(gameState, playerId)

  if (!gameState.isStarted) {
    throw new GameMutationInputError('Game is not started')
  }

  const gameIsOver = gameState.players.filter(({ influences }) => influences.length).length === 1
  if (!gameIsOver) {
    const pendingResetFromOtherPlayer = player.influences.length
      && gameState.resetGameRequest
      && gameState.resetGameRequest?.player !== player.name
    if (humanOpponentsRemain(gameState, player) && !pendingResetFromOtherPlayer) {
      throw new GameMutationInputError('Current game is in progress')
    }
  }

  await resetGame(roomId)

  return { roomId, playerId }
}

export const forfeitGameHandler = async ({ roomId, playerId, replaceWithAi }: {
  roomId: string
  playerId: string
  replaceWithAi: boolean
}) => {
  const gameState = await getGameState(roomId)

  const player = getPlayerInRoom(gameState, playerId)

  if (!gameState.isStarted) {
    throw new GameMutationInputError('Game is not started')
  }

  if (gameState.players.filter(({ influences }) => influences.length).length === 1) {
    throw new GameMutationInputError('Game is already over')
  }

  if (!player.influences.length) {
    throw new GameMutationInputError('You are already dead')
  }

  await mutateGameState(gameState, (state) => {
    const playerToForfeit = state.players.find(({ id }) => id === playerId)
    if (!playerToForfeit) {
      throw new GameMutationInputError('Unable to find player')
    }

    if (gameState.pendingInfluenceLoss[playerToForfeit.name]?.length) {
      throw new GameMutationInputError('You can\'t forfeit while pending influence loss')
    }

    if (state.turnPlayer === playerToForfeit.name && state.pendingAction) {
      throw new GameMutationInputError('You can\'t forfeit while your action is pending')
    }
    if (state.pendingAction?.targetPlayer === playerToForfeit.name) {
      throw new GameMutationInputError('You can\'t forfeit while action is targeted at you')
    }
    if (state.pendingActionChallenge?.sourcePlayer === playerToForfeit.name) {
      throw new GameMutationInputError('You can\'t forfeit while your action challenge is pending')
    }
    if (state.pendingBlock?.sourcePlayer === playerToForfeit.name) {
      throw new GameMutationInputError('You can\'t forfeit while your block is pending')
    }
    if (state.pendingBlockChallenge?.sourcePlayer === playerToForfeit.name) {
      throw new GameMutationInputError('You can\'t forfeit while your block challenge is pending')
    }

    if (replaceWithAi) {
      playerToForfeit.id = crypto.randomUUID()
      playerToForfeit.ai = true
      playerToForfeit.personalityHidden = true
      logEvent(state, {
        event: EventMessages.PlayerReplacedWithAi,
        primaryPlayer: player.name
      })
    } else {
      playerToForfeit.deadInfluences.push(...playerToForfeit.influences)
      playerToForfeit.influences = []
      if (state.pendingAction?.pendingPlayers.has(playerToForfeit.name)) {
        processPassActionResponse(state, playerToForfeit.name)
      }
      if (state.pendingBlock?.pendingPlayers.has(playerToForfeit.name)) {
        processPassBlockResponse(state, playerToForfeit.name)
      }
      if (state.turnPlayer === playerToForfeit.name) {
        moveTurnToNextPlayer(state)
      }
      logEvent(state, {
        event: EventMessages.PlayerForfeited,
        primaryPlayer: player.name
      })
    }
  })

  return { roomId, playerId }
}

export const startGameHandler = async ({ roomId, playerId }: {
  roomId: string
  playerId: string
}) => {
  const gameState = await getGameState(roomId)

  getPlayerInRoom(gameState, playerId)

  if (gameState.players.length < 2) {
    throw new GameMutationInputError('Game must have at least 2 players to start')
  }

  if (gameState.isStarted) {
    throw new GameMutationInputError('Game has already started')
  }

  await mutateGameState(gameState, startGame)

  return { roomId, playerId }
}

export const checkAiMoveHandler = async ({ roomId, playerId }: {
  roomId: string
  playerId: string
}) => {
  const gameState = await getGameState(roomId)

  const unchangedResponse = { roomId, playerId, stateUnchanged: true }
  const changedResponse = { roomId, playerId }

  const playersLeft = gameState.players.filter(({ influences }) => influences.length)
  const gameIsOver = playersLeft.length === 1

  const timeToPonderLifeChoices = 500 + Math.floor(Math.random() * 1000)
  if (gameIsOver || new Date() < new Date(gameState.lastEventTimestamp.getTime() + timeToPonderLifeChoices)) {
    return unchangedResponse
  }

  const pendingLossPlayers = Object.keys(gameState.pendingInfluenceLoss)
  const nextPendingLossAiPlayer = gameState.players.find(({ ai, name }) =>
    ai && pendingLossPlayers.includes(name))
  if (nextPendingLossAiPlayer) {
    const { influences } = decideInfluencesToLose(
      getPublicGameState({ gameState, playerId: nextPendingLossAiPlayer.id })
    )

    await loseInfluencesHandler({
      roomId,
      playerId: nextPendingLossAiPlayer.id,
      influences
    })

    return changedResponse
  }

  const turnPlayer = gameState.players.find(({ name }) => name === gameState.turnPlayer)

  const turnPlayerState = getPublicGameState({ gameState, playerId: turnPlayer!.id })

  if (turnPlayer?.ai && canPlayerChooseAction(turnPlayerState)) {
    const { action, targetPlayer } = decideAction(turnPlayerState)

    await actionHandler({
      roomId,
      playerId: turnPlayer.id,
      action,
      ...(targetPlayer && { targetPlayer })
    })

    return changedResponse
  }

  let nextPendingAiPlayer = gameState.players.find(({ ai, id }) =>
    ai && canPlayerChooseActionResponse(getPublicGameState({ gameState, playerId: id })))
  if (nextPendingAiPlayer) {
    const { response, claimedInfluence } = decideActionResponse(
      getPublicGameState({ gameState, playerId: nextPendingAiPlayer.id })
    )

    await actionResponseHandler({
      roomId,
      playerId: nextPendingAiPlayer.id,
      response,
      ...(claimedInfluence && { claimedInfluence })
    })

    return changedResponse
  }

  if (turnPlayer?.ai && canPlayerChooseActionChallengeResponse(turnPlayerState)) {
    const { influence } = decideActionChallengeResponse(
      getPublicGameState({ gameState, playerId: turnPlayer.id })
    )

    await actionChallengeResponseHandler({
      roomId,
      playerId: turnPlayer.id,
      influence
    })

    return changedResponse
  }

  nextPendingAiPlayer = gameState.players.find(({ ai, id }) =>
    ai && canPlayerChooseBlockResponse(getPublicGameState({ gameState, playerId: id })))
  if (nextPendingAiPlayer) {
    const { response } = decideBlockResponse(
      getPublicGameState({ gameState, playerId: nextPendingAiPlayer.id })
    )

    await blockResponseHandler({
      roomId,
      playerId: nextPendingAiPlayer.id,
      response
    })

    return changedResponse
  }

  nextPendingAiPlayer = gameState.players.find(({ ai, id }) =>
    ai && canPlayerChooseBlockChallengeResponse(getPublicGameState({ gameState, playerId: id })))
  if (nextPendingAiPlayer) {
    const { influence } = decideBlockChallengeResponse(
      getPublicGameState({ gameState, playerId: nextPendingAiPlayer.id })
    )

    await blockChallengeResponseHandler({
      roomId,
      playerId: nextPendingAiPlayer.id,
      influence
    })

    return changedResponse
  }

  return unchangedResponse
}

export const actionHandler = async ({ roomId, playerId, action, targetPlayer }: {
  roomId: string
  playerId: string
  action: Actions
  targetPlayer?: string
}) => {
  const gameState = await getGameState(roomId)

  const player = getPlayerInRoom(gameState, playerId)

  if (!player.influences.length) {
    throw new GameMutationInputError('You had your chance')
  }

  if ((ActionAttributes[action].coinsRequired ?? 0) > player.coins) {
    throw new GameMutationInputError('You don\'t have enough coins')
  }

  if (player.coins >= 10 && ![Actions.Coup, Actions.Revive].includes(action)) {
    throw new GameMutationInputError(`You must ${Actions.Coup} or ${Actions.Revive} when you have 10 or more coins`)
  }

  if (action === Actions.Revive) {
    if (!gameState.settings.allowRevive) {
      throw new GameMutationInputError('Revive action is not allowed in this game')
    }
    if (!player.deadInfluences.length) {
      throw new GameMutationInputError('You have no dead influences to revive')
    }
  }

  if (targetPlayer && !gameState.players.some((player) => player.name === targetPlayer)) {
    throw new GameMutationInputError('Unknown target player')
  }

  if (ActionAttributes[action].requiresTarget && !targetPlayer) {
    throw new GameMutationInputError('Target player is required for this action')
  }

  if (!ActionAttributes[action].requiresTarget && targetPlayer) {
    throw new GameMutationInputError('Target player is not allowed for this action')
  }

  if (targetPlayer === player.name) {
    throw new GameMutationInputError('You can\'t target yourself')
  }

  if (!ActionAttributes[action].blockable && !ActionAttributes[action].challengeable) {
    if (action === Actions.Coup) {
      await mutateGameState(gameState, (state) => {
        if (!targetPlayer) {
          throw new GameMutationInputError('No target player for coup')
        }

        const coupingPlayer = state.players.find(({ id }) => id === playerId)

        if (!coupingPlayer) {
          throw new GameMutationInputError('Unable to find couping player')
        }

        if (coupingPlayer.coins !== player.coins) {
          throw new GameMutationInputError('Unexpected player state, refusing mutation')
        }

        if (!canPlayerChooseAction(getPublicGameState({ gameState: state, playerId: coupingPlayer.id }))) {
          throw new GameMutationInputError('You can\'t choose an action right now')
        }

        coupingPlayer.coins -= ActionAttributes.Coup.coinsRequired!
        logEvent(state, {
          event: EventMessages.ActionProcessed,
          action,
          primaryPlayer: player.name,
          secondaryPlayer: targetPlayer
        })
        holdGrudge({ state, offended: targetPlayer, offender: coupingPlayer.name, weight: grudgeSizes[Actions.Coup] })
        promptPlayerToLoseInfluence(state, targetPlayer)
      })
    } else if (action === Actions.Revive) {
      await mutateGameState(gameState, (state) => {
        const revivePlayer = state.players.find(({ id }) => id === playerId)

        if (!revivePlayer) {
          throw new GameMutationInputError('Unable to find revive player')
        }

        if (revivePlayer.coins !== player.coins) {
          throw new GameMutationInputError('Unexpected player state, refusing mutation')
        }

        if (!canPlayerChooseAction(getPublicGameState({ gameState: state, playerId: revivePlayer.id }))) {
          throw new GameMutationInputError('You can\'t choose an action right now')
        }

        revivePlayer.coins -= 10
        const influenceToRevive = revivePlayer.deadInfluences.pop()
        if (!influenceToRevive) {
          throw new GameMutationInputError('Unable to find dead influences to revive')
        }
        revivePlayer.influences.push(influenceToRevive)
        revealAndReplaceInfluence(state, revivePlayer.name, influenceToRevive, false)
        moveTurnToNextPlayer(state)
        logEvent(state, {
          event: EventMessages.ActionProcessed,
          action,
          primaryPlayer: player.name
        })
      })
    } else if (action === Actions.Income) {
      await mutateGameState(gameState, (state) => {
        const incomePlayer = state.players.find(({ id }) => id === playerId)

        if (!incomePlayer) {
          throw new GameMutationInputError('Unable to find income player')
        }

        if (incomePlayer.coins !== player.coins) {
          throw new GameMutationInputError('Unexpected player state, refusing mutation')
        }

        if (!canPlayerChooseAction(getPublicGameState({ gameState: state, playerId: incomePlayer.id }))) {
          throw new GameMutationInputError('You can\'t choose an action right now')
        }

        incomePlayer.coins += 1
        moveTurnToNextPlayer(state)
        logEvent(state, {
          event: EventMessages.ActionProcessed,
          action,
          primaryPlayer: player.name
        })
      })
    }
  } else {
    await mutateGameState(gameState, (state) => {
      if (!canPlayerChooseAction(getPublicGameState({ gameState: state, playerId: player.id }))) {
        throw new GameMutationInputError('You can\'t choose an action right now')
      }

      state.pendingAction = {
        action,
        pendingPlayers: state.players.reduce((agg, cur) => {
          if (cur.influences.length && cur.name !== player.name) {
            agg.add(cur.name)
          }
          return agg
        }, new Set<string>()),
        ...(targetPlayer && { targetPlayer }),
        claimConfirmed: false
      }
      logEvent(state, {
        event: EventMessages.ActionPending,
        action,
        primaryPlayer: player.name,
        ...(targetPlayer && { secondaryPlayer: targetPlayer })
      })
    })
  }

  return { roomId, playerId }
}

export const processPassActionResponse = (state: GameState, playerName: string) => {
  if (!state.pendingAction) {
    throw new GameMutationInputError('Unable to find pending action')
  }

  const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer)
  const respondingPlayer = state.players.find(({ name }) => name === playerName)

  if (!actionPlayer) {
    throw new GameMutationInputError('Unable to find action player')
  }

  if (!respondingPlayer) {
    throw new GameMutationInputError('Unable to find responding player')
  }

  if (state.pendingAction.action === Actions.ForeignAid) {
    addUnclaimedInfluence(respondingPlayer, Influences.Duke)
  }

  if (state.pendingAction.targetPlayer === playerName) {
    const targetPlayer = state.players.find(({ name }) => name === state.pendingAction?.targetPlayer)

    if (!targetPlayer) {
      throw new GameMutationInputError('Unable to find target player')
    }

    if (state.pendingAction.action === Actions.Steal) {
      addUnclaimedInfluence(targetPlayer, Influences.Captain)
      addUnclaimedInfluence(targetPlayer, Influences.Ambassador)
    } else if (state.pendingAction.action === Actions.Assassinate) {
      addUnclaimedInfluence(targetPlayer, Influences.Contessa)
    }
  }

  if (state.pendingAction.pendingPlayers.size === 1) {
    const claimedInfluence = ActionAttributes[state.pendingAction.action].influenceRequired
    if (claimedInfluence) {
      addClaimedInfluence(actionPlayer, claimedInfluence)
    }
    processPendingAction(state)
  } else {
    state.pendingAction.pendingPlayers.delete(playerName)
  }
}

export const actionResponseHandler = async ({ roomId, playerId, response, claimedInfluence }: {
  roomId: string
  playerId: string
  response: Responses
  claimedInfluence?: Influences
}) => {
  const gameState = await getGameState(roomId)

  const player = getPlayerInRoom(gameState, playerId)

  if (!player.influences.length) {
    throw new GameMutationInputError('You had your chance')
  }

  if (!canPlayerChooseActionResponse(getPublicGameState({ gameState, playerId: player.id }))) {
    throw new GameMutationInputError('You can\'t choose an action response right now')
  }

  if (response === Responses.Pass) {
    await mutateGameState(gameState, (state) => {
      processPassActionResponse(state, player.name)
    })
  } else if (response === Responses.Challenge) {
    if (gameState.pendingAction!.claimConfirmed) {
      throw new GameMutationInputError(`${gameState.turnPlayer} has already confirmed their claim`)
    }

    if (!ActionAttributes[gameState.pendingAction!.action].challengeable) {
      throw new GameMutationInputError(`${gameState.pendingAction!.action} is not challengeable`)
    }

    await mutateGameState(gameState, (state) => {
      state.pendingActionChallenge = {
        sourcePlayer: player.name
      }
      logEvent(state, {
        event: EventMessages.ChallengePending,
        primaryPlayer: player.name,
        secondaryPlayer: state.turnPlayer!
      })
    })
  } else if (response === Responses.Block) {
    if (!claimedInfluence) {
      throw new GameMutationInputError('claimedInfluence is required when blocking')
    }

    if (InfluenceAttributes[claimedInfluence as Influences].legalBlock !== gameState.pendingAction!.action) {
      throw new GameMutationInputError('claimedInfluence can\'t block this action')
    }

    if (gameState.pendingAction!.targetPlayer &&
      player.name !== gameState.pendingAction!.targetPlayer
    ) {
      throw new GameMutationInputError(`You are not the target of the pending action`)
    }

    await mutateGameState(gameState, (state) => {
      if (!state.pendingAction) {
        throw new GameMutationInputError('Unable to find pending action')
      }

      state.pendingAction.pendingPlayers = new Set<string>()
      state.pendingBlock = {
        sourcePlayer: player.name,
        claimedInfluence,
        pendingPlayers: state.players.reduce((agg, cur) => {
          if (cur.influences.length && cur.name !== player.name) {
            agg.add(cur.name)
          }
          return agg
        }, new Set<string>()),
      }
      logEvent(state, {
        event: EventMessages.BlockPending,
        primaryPlayer: player.name,
        secondaryPlayer: state.turnPlayer!,
        influence: claimedInfluence
      })
    })
  }

  return { roomId, playerId }
}

export const actionChallengeResponseHandler = async ({ roomId, playerId, influence }: {
  roomId: string
  playerId: string
  influence: Influences
}) => {
  const gameState = await getGameState(roomId)

  const player = getPlayerInRoom(gameState, playerId)

  if (!player.influences.length) {
    throw new GameMutationInputError('You had your chance')
  }

  if (!canPlayerChooseActionChallengeResponse(getPublicGameState({ gameState, playerId: player.id }))) {
    throw new GameMutationInputError('You can\'t choose a challenge response right now')
  }

  if (!player.influences.includes(influence)) {
    throw new GameMutationInputError('You don\'t have that influence')
  }

  if (InfluenceAttributes[influence as Influences].legalAction === gameState.pendingAction!.action) {
    await mutateGameState(gameState, (state) => {
      if (!state.pendingAction || !state.pendingActionChallenge) {
        throw new GameMutationInputError('Unable to find pending action or pending action challenge')
      }

      const challengePlayer = state.players.find(({ name }) => name === state.pendingActionChallenge!.sourcePlayer)

      if (!state.turnPlayer || !challengePlayer) {
        throw new GameMutationInputError('Unable to find turn player or challenge player')
      }

      revealAndReplaceInfluence(state, state.turnPlayer, influence)
      logEvent(state, {
        event: EventMessages.ChallengeFailed,
        primaryPlayer: challengePlayer.name,
        secondaryPlayer: state.turnPlayer!
      })
      promptPlayerToLoseInfluence(state, challengePlayer.name)
      delete state.pendingActionChallenge
      state.pendingAction.claimConfirmed = true
      if (state.pendingAction.targetPlayer) {
        const targetPlayer = state.players.find(({ name }) => name === state.pendingAction!.targetPlayer)

        if (!targetPlayer) {
          throw new GameMutationInputError('Unable to find target player')
        }

        const remainingInfluenceCount = targetPlayer.influences.length - (state.pendingInfluenceLoss[targetPlayer.name]?.length ?? 0)
        if (remainingInfluenceCount > 0) {
          state.pendingAction.pendingPlayers = new Set([state.pendingAction.targetPlayer])
        } else {
          processPendingAction(state)
        }
      } else if (ActionAttributes[state.pendingAction.action].blockable) {
        state.pendingAction.pendingPlayers = state.players.reduce((agg, cur) => {
          if (cur.influences.length && cur.name !== state.turnPlayer) {
            agg.add(cur.name)
          }
          return agg
        }, new Set<string>())
      } else {
        processPendingAction(state)
      }
    })
  } else {
    await mutateGameState(gameState, (state) => {
      const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer)
      const challengePlayer = state.players.find(({ name }) => name === state.pendingActionChallenge?.sourcePlayer)

      if (!actionPlayer || !challengePlayer) {
        throw new GameMutationInputError('Unable to find action player or challenge player')
      }

      logEvent(state, {
        event: EventMessages.ChallengeSuccessful,
        primaryPlayer: challengePlayer.name,
        secondaryPlayer: state.turnPlayer!
      })
      const claimedInfluence = ActionAttributes[state.pendingAction!.action].influenceRequired
      if (claimedInfluence) {
        removeClaimedInfluence(actionPlayer, claimedInfluence)
        addUnclaimedInfluence(actionPlayer, claimedInfluence)
      }
      holdGrudge({ state, offended: state.turnPlayer!, offender: challengePlayer.name, weight: grudgeSizes[Responses.Challenge] })
      killPlayerInfluence(state, actionPlayer.name, influence)
      moveTurnToNextPlayer(state)
      delete state.pendingActionChallenge
      delete state.pendingAction
    })
  }

  return { roomId, playerId }
}

export const processPassBlockResponse = (state: GameState, playerName: string) => {
  if (!state.pendingAction || !state.pendingBlock) {
    throw new GameMutationInputError('Unable to find pending action or pending block')
  }

  if (state.pendingBlock.pendingPlayers.size === 1) {
    const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer)
    const blockPlayer = state.players.find(({ name }) => name === state.pendingBlock?.sourcePlayer)

    if (!actionPlayer) {
      throw new GameMutationInputError('Unable to find action player')
    }

    if (!blockPlayer) {
      throw new GameMutationInputError('Unable to find blocking player')
    }

    const claimedInfluence = ActionAttributes[state.pendingAction!.action].influenceRequired
    if (claimedInfluence) {
      addClaimedInfluence(actionPlayer, claimedInfluence)
    }
    addClaimedInfluence(blockPlayer, state.pendingBlock?.claimedInfluence)
    logEvent(state, {
      event: EventMessages.BlockSuccessful,
      primaryPlayer: blockPlayer.name,
      secondaryPlayer: state.turnPlayer!
    })
    if (state.pendingAction.action === Actions.Assassinate) {
      const assassin = state.players.find(({ name }) => name === state.turnPlayer)

      if (!assassin) {
        throw new GameMutationInputError('Unable to find assassinating player')
      }

      assassin.coins -= ActionAttributes.Assassinate.coinsRequired!
    }
    moveTurnToNextPlayer(state)
    delete state.pendingBlock
    delete state.pendingActionChallenge
    delete state.pendingAction
  } else {
    state.pendingBlock.pendingPlayers.delete(playerName)
  }
}

export const blockResponseHandler = async ({ roomId, playerId, response }: {
  roomId: string
  playerId: string
  response: Responses
}) => {
  const gameState = await getGameState(roomId)

  const player = getPlayerInRoom(gameState, playerId)

  if (!player.influences.length) {
    throw new GameMutationInputError('You had your chance')
  }

  if (!canPlayerChooseBlockResponse(getPublicGameState({ gameState, playerId: player.id }))) {
    throw new GameMutationInputError('You can\'t choose a block response right now')
  }

  if (response === Responses.Block) {
    throw new GameMutationInputError('You can\'t block a block')
  }

  if (response === Responses.Challenge) {
    await mutateGameState(gameState, (state) => {
      const blockPlayer = state.players.find(({ name }) => name === state.pendingBlock?.sourcePlayer)

      if (!blockPlayer) {
        throw new GameMutationInputError('Unable to find blocking player')
      }

      logEvent(state, {
        event: EventMessages.ChallengePending,
        primaryPlayer: player.name,
        secondaryPlayer: blockPlayer.name
      })
      state.pendingBlockChallenge = { sourcePlayer: player.name }
    })
  } else if (response === Responses.Pass) {
    await mutateGameState(gameState, (state) => {
      processPassBlockResponse(state, player.name)
    })
  }

  return { roomId, playerId }
}

export const blockChallengeResponseHandler = async ({ roomId, playerId, influence }: {
  roomId: string
  playerId: string
  influence: Influences
}) => {
  const gameState = await getGameState(roomId)

  const player = getPlayerInRoom(gameState, playerId)

  if (!player.influences.length) {
    throw new GameMutationInputError('You had your chance')
  }

  if (!canPlayerChooseBlockChallengeResponse(getPublicGameState({ gameState, playerId: player.id }))) {
    throw new GameMutationInputError('You can\'t choose a challenge response right now')
  }

  if (!player.influences.includes(influence)) {
    throw new GameMutationInputError('You don\'t have that influence')
  }

  if (influence === gameState.pendingBlock!.claimedInfluence) {
    await mutateGameState(gameState, (state) => {
      if (!state.pendingAction || !state.pendingBlock) {
        throw new GameMutationInputError('Unable to find pending action or pending block')
      }

      const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer)
      const challengePlayer = state.players.find(({ name }) => name === state.pendingBlockChallenge?.sourcePlayer)

      if (!actionPlayer) {
        throw new GameMutationInputError('Unable to find action player')
      }

      if (!challengePlayer) {
        throw new GameMutationInputError('Unable to find challenging player')
      }

      const claimedInfluence = ActionAttributes[state.pendingAction!.action].influenceRequired
      if (claimedInfluence) {
        addClaimedInfluence(actionPlayer, claimedInfluence)
      }

      revealAndReplaceInfluence(state, state.pendingBlock.sourcePlayer, influence)
      logEvent(state, {
        event: EventMessages.BlockSuccessful,
        primaryPlayer: state.pendingBlock.sourcePlayer,
        secondaryPlayer: state.turnPlayer!
      })
      if (state.pendingAction.action === Actions.Assassinate) {
        const assassin = state.players.find(({ name }) => name === state.turnPlayer)

        if (!assassin) {
          throw new GameMutationInputError('Unable to find assassinating player')
        }

        assassin.coins -= ActionAttributes.Assassinate.coinsRequired!
      }
      delete state.pendingBlockChallenge
      delete state.pendingBlock
      delete state.pendingActionChallenge
      delete state.pendingAction

      promptPlayerToLoseInfluence(state, challengePlayer.name)
    })
  } else {
    await mutateGameState(gameState, (state) => {
      const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer)
      const blockPlayer = state.players.find(({ name }) => name === state.pendingBlock?.sourcePlayer)
      const challengePlayer = state.players.find(({ name }) => name === state.pendingBlockChallenge?.sourcePlayer)

      if (!actionPlayer) {
        throw new GameMutationInputError('Unable to find action player')
      }

      if (!blockPlayer) {
        throw new GameMutationInputError('Unable to find blocking player')
      }

      if (!challengePlayer) {
        throw new GameMutationInputError('Unable to find challenging player')
      }

      logEvent(state, {
        event: EventMessages.ChallengeSuccessful,
        primaryPlayer: challengePlayer.name,
        secondaryPlayer: blockPlayer.name
      })
      logEvent(state, {
        event: EventMessages.BlockFailed,
        primaryPlayer: blockPlayer.name,
        secondaryPlayer: state.turnPlayer!
      })
      const claimedInfluence = ActionAttributes[state.pendingAction!.action].influenceRequired
      if (claimedInfluence) {
        addClaimedInfluence(actionPlayer, claimedInfluence)
      }
      removeClaimedInfluence(blockPlayer, state.pendingBlock!.claimedInfluence)
      addUnclaimedInfluence(blockPlayer, state.pendingBlock!.claimedInfluence)
      holdGrudge({ state, offended: blockPlayer.name, offender: challengePlayer.name, weight: grudgeSizes[Responses.Challenge] })
      killPlayerInfluence(state, blockPlayer.name, influence)
      processPendingAction(state)
      delete state.pendingBlockChallenge
      delete state.pendingBlock
      delete state.pendingActionChallenge
      delete state.pendingAction
    })
  }

  return { roomId, playerId }
}

export const loseInfluencesHandler = async ({ roomId, playerId, influences }: {
  roomId: string
  playerId: string
  influences: Influences[]
}) => {
  const gameState = await getGameState(roomId)

  const player = getPlayerInRoom(gameState, playerId)

  if (!player.influences.length) {
    throw new GameMutationInputError('You had your chance')
  }

  const influenceCounts = influences.reduce((agg, cur) => {
    agg[cur] = (agg[cur] ?? 0) + 1
    return agg
  }, {} as { [key in Influences]: number })

  if (Object.entries(influenceCounts).some(([i, count]) => player.influences.filter((pi) => pi === i).length < count)) {
    throw new GameMutationInputError('You don\'t have those influences')
  }

  const pendingInfluenceLossCount = gameState.pendingInfluenceLoss[player.name]?.length ?? 0
  if (influences.length > pendingInfluenceLossCount) {
    throw new GameMutationInputError(`You can't lose ${influences.length} influence${influences.length === 1 ? '' : 's'} right now`)
  }

  await mutateGameState(gameState, (state) => {
    const losingPlayer = state.players.find(({ id }) => id === playerId)

    if (!losingPlayer) {
      throw new GameMutationInputError('Unable to find influence loss player')
    }

    const putBackInDeck = state.pendingInfluenceLoss[losingPlayer.name][0].putBackInDeck

    influences.forEach((influence) => {
      if (state.pendingInfluenceLoss[losingPlayer.name].length > 1) {
        state.pendingInfluenceLoss[losingPlayer.name].splice(0, 1)
      } else {
        delete state.pendingInfluenceLoss[losingPlayer.name]
      }

      if (putBackInDeck) {
        const removedInfluence = losingPlayer.influences.splice(
          losingPlayer.influences.findIndex((i) => i === influence),
          1
        )[0]
        state.deck.unshift(removedInfluence)

        if (!Object.keys(state.pendingInfluenceLoss).length && !state.pendingAction) {
          moveTurnToNextPlayer(state)
        }
      } else {
        killPlayerInfluence(state, losingPlayer.name, influence)
      }
    })
  })

  return { roomId, playerId }
}

export const sendChatMessageHandler = async ({ roomId, playerId, messageId, messageText }: {
  roomId: string
  playerId: string
  messageId: string
  messageText: string
}) => {
  const gameState = await getGameState(roomId)

  const player = getPlayerInRoom(gameState, playerId)

  await mutateGameState(gameState, (state) => {
    const existingMessage = state.chatMessages.find(({ id }) => id === messageId)

    if (existingMessage && existingMessage?.from !== player.name) {
      throw new GameMutationInputError('This is not your message')
    }

    if (existingMessage) {
      existingMessage.text = messageText
      return
    }

    state.chatMessages.push({
      id: messageId,
      text: messageText,
      from: player.name,
      timestamp: new Date(),
      deleted: false
    })

    const maxMessageCount = 500
    if (state.chatMessages.length > maxMessageCount) {
      state.chatMessages.splice(0, state.chatMessages.length - maxMessageCount)
    }
  })

  return { roomId, playerId }
}

export const setChatMessageDeletedHandler = async ({ roomId, playerId, messageId, deleted }: {
  roomId: string
  playerId: string
  messageId: string
  deleted: boolean
}) => {
  const gameState = await getGameState(roomId)

  const player = getPlayerInRoom(gameState, playerId)

  await mutateGameState(gameState, (state) => {
    const existingMessage = state.chatMessages.find(({ id }) => id === messageId)

    if (!existingMessage) {
      throw new GameMutationInputError('Message id does not exist')
    }

    if (existingMessage.from !== player.name) {
      throw new GameMutationInputError('This is not your message')
    }

    existingMessage.deleted = deleted
  })

  return { roomId, playerId }
}

export const setEmojiOnChatMessageHandler = async ({
  roomId,
  playerId,
  messageId,
  emoji,
  selected,
}: {
  roomId: string;
  playerId: string;
  messageId: string;
  emoji: string;
  selected: boolean;
}) => {
  const gameState = await getGameState(roomId)

  const player = getPlayerInRoom(gameState, playerId)

  await mutateGameState(gameState, (state) => {
    const existingMessage = state.chatMessages.find(
      ({ id }) => id === messageId
    )

    if (!existingMessage) {
      throw new GameMutationInputError("Message id does not exist")
    }

    if (selected) {
      if (!existingMessage.emojis) {
        existingMessage.emojis = {}
      }
      if (!existingMessage.emojis[emoji]) {
        existingMessage.emojis[emoji] = new Set()
      }
      existingMessage.emojis[emoji].add(player.name)
    } else {
      if (existingMessage.emojis?.[emoji]) {
        existingMessage.emojis[emoji].delete(player.name)
        if (!existingMessage.emojis[emoji].size) {
          delete existingMessage.emojis[emoji]
        }
      }
    }
  })

  return { roomId, playerId }
}
