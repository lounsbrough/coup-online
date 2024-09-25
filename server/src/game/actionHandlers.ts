import { GameMutationInputError } from "../utilities/errors"
import { ActionAttributes, Actions, GameState, InfluenceAttributes, Influences, Responses } from "../../../shared/types/game"
import { getGameState, logEvent, mutateGameState } from "../utilities/gameState"
import { generateRoomId } from "../utilities/identifiers"
import { addPlayerToGame, createNewGame, killPlayerInfluence, moveTurnToNextPlayer, processPendingAction, promptPlayerToLoseInfluence, resetGame, revealAndReplaceInfluence, startGame } from "./logic"

const validateRoomId = (gameState: GameState, roomId: string) => {
  if (!gameState) {
    throw new GameMutationInputError(`Room ${roomId} does not exist`, 404)
  }
}

const validateRoomIdAndPlayerId = (gameState: GameState, roomId: string, playerId: string) => {
  validateRoomId(gameState, roomId)

  const player = gameState.players.find(({ id }) => id === playerId)

  if (!player) {
    throw new GameMutationInputError('Player not in game')
  }
}

export const getGameStateHandler = async ({ roomId, playerId }: {
  roomId: string
  playerId: string
}) => {
  const gameState = await getGameState(roomId)

  validateRoomIdAndPlayerId(gameState, roomId, playerId)

  return { roomId, playerId }
}

export const createGameHandler = async ({ playerId, playerName }: {
  playerId: string
  playerName: string
}) => {
  const roomId = generateRoomId()

  await createNewGame(roomId, playerId, playerName)

  return { roomId, playerId }
}

export const joinGameHandler = async ({ roomId, playerId, playerName }: {
  roomId: string
  playerId: string
  playerName: string
}) => {
  const gameState = await getGameState(roomId)

  validateRoomId(gameState, roomId)

  const existingPlayer = gameState.players.find((player) => player.id === playerId)

  if (existingPlayer) {
    if (existingPlayer.name.toUpperCase() !== playerName.toUpperCase()) {
      throw new GameMutationInputError(`Previously joined Room ${roomId} as ${existingPlayer.name}`)
    }
  } else {
    if (gameState.players.length >= 6) {
      throw new GameMutationInputError(`Room ${roomId} is full`)
    }

    if (gameState.isStarted) {
      throw new GameMutationInputError('Game has already started')
    }

    if (gameState.players.some((existingPlayer) =>
      existingPlayer.name.toUpperCase() === playerName.toUpperCase()
    )) {
      throw new GameMutationInputError(`Room ${roomId} already has player named ${playerName}`)
    }

    await mutateGameState(roomId, (state) => {
      addPlayerToGame(state, playerId, playerName)
    })
  }

  return { roomId, playerId }
}

export const resetGameHandler = async ({ roomId, playerId }: {
  roomId: string
  playerId: string
}) => {
  const gameState = await getGameState(roomId)

  validateRoomIdAndPlayerId(gameState, roomId, playerId)

  if (gameState.isStarted && gameState.players.filter(({ influences }) => influences.length).length > 1) {
    throw new GameMutationInputError('Current game is in progress')
  }

  await resetGame(roomId)

  return { roomId, playerId }
}

export const startGameHandler = async ({ roomId, playerId }: {
  roomId: string
  playerId: string
}) => {
  const gameState = await getGameState(roomId)

  validateRoomIdAndPlayerId(gameState, roomId, playerId)

  if (gameState.players.length < 2) {
    throw new GameMutationInputError('Game must have at least 2 players to start')
  }

  if (gameState.isStarted) {
    throw new GameMutationInputError('Game has already started')
  }

  await startGame(roomId)

  return { roomId, playerId }
}

export const actionHandler = async ({ roomId, playerId, action, targetPlayer }: {
  roomId: string
  playerId: string
  action: Actions,
  targetPlayer: string
}) => {
  const gameState = await getGameState(roomId)

  validateRoomIdAndPlayerId(gameState, roomId, playerId)

  const player = gameState.players.find(({ id }) => id === playerId)

  if (!player.influences.length) {
    throw new GameMutationInputError('You had your chance')
  }

  if (gameState.turnPlayer !== player.name
    || gameState.pendingAction
    || gameState.pendingActionChallenge
    || gameState.pendingBlock
    || gameState.pendingBlockChallenge) {
    throw new GameMutationInputError('You can\'t choose an action right now')
  }

  if ((ActionAttributes[action].coinsRequired ?? 0) > player.coins) {
    throw new GameMutationInputError('You don\'t have enough coins')
  }

  if (player.coins >= 10 && action !== Actions.Coup) {
    throw new GameMutationInputError('You must coup when you have 10 or more coins')
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

  return { roomId, playerId }
}

export const actionResponseHandler = async ({ roomId, playerId, response, claimedInfluence }: {
  roomId: string
  playerId: string
  response: Responses,
  claimedInfluence: Influences
}) => {
  const gameState = await getGameState(roomId)

  validateRoomIdAndPlayerId(gameState, roomId, playerId)

  const player = gameState.players.find(({ id }) => id === playerId)

  if (!player.influences.length) {
    throw new GameMutationInputError('You had your chance')
    return
  }

  if (!gameState.pendingAction
    || gameState.pendingActionChallenge
    || !gameState.pendingAction.pendingPlayers.includes(player.name)) {
    throw new GameMutationInputError('You can\'t choose an action response right now')
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
      throw new GameMutationInputError(`${gameState.turnPlayer} has already confirmed their claim`)
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
      throw new GameMutationInputError('claimedInfluence is required when blocking')
      return
    }

    if (InfluenceAttributes[claimedInfluence as Influences].legalBlock !== gameState.pendingAction.action) {
      throw new GameMutationInputError('claimedInfluence can not block this action')
      return
    }

    if (gameState.pendingAction.targetPlayer &&
      player.name !== gameState.pendingAction.targetPlayer
    ) {
      throw new GameMutationInputError(`You are not the target of the pending action`)
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

  return { roomId, playerId }
}

export const actionChallengeResponseHandler = async ({ roomId, playerId, influence }: {
  roomId: string
  playerId: string
  influence: Influences
}) => {
  const gameState = await getGameState(roomId)

  validateRoomIdAndPlayerId(gameState, roomId, playerId)

  const player = gameState.players.find(({ id }) => id === playerId)

  if (!player.influences.length) {
    throw new GameMutationInputError('You had your chance')
  }

  if (!gameState.pendingActionChallenge) {
    throw new GameMutationInputError('You can\'t choose a challenge response right now')
  }

  if (!player.influences.includes(influence)) {
    throw new GameMutationInputError('You don\'t have that influence')
  }

  if (InfluenceAttributes[influence as Influences].legalAction === gameState.pendingAction.action) {
    await mutateGameState(roomId, (state) => {
      const challengePlayer = state.players.find(({ name }) => name === state.pendingActionChallenge.sourcePlayer)
      promptPlayerToLoseInfluence(state, challengePlayer.name)
      revealAndReplaceInfluence(state, state.turnPlayer, influence)
      logEvent(state, `${challengePlayer.name} failed to challenge ${state.turnPlayer}`)
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
      console.log(state)
    })
  }

  return { roomId, playerId }
}

export const blockResponseHandler = async ({ roomId, playerId, response }: {
  roomId: string
  playerId: string
  response: Responses
}) => {
  const gameState = await getGameState(roomId)

  validateRoomIdAndPlayerId(gameState, roomId, playerId)

  const player = gameState.players.find(({ id }) => id === playerId)

  if (!player.influences.length) {
    throw new GameMutationInputError('You had your chance')
  }

  if (!gameState.pendingBlock
    || gameState.pendingBlockChallenge
    || !gameState.pendingBlock.pendingPlayers.includes(player.name)
  ) {
    throw new GameMutationInputError('You can\'t choose a block response right now')
  }

  if (response === Responses.Block) {
    throw new GameMutationInputError('You can\'t block a block')
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

  return { roomId, playerId }
}

export const blockChallengeResponseHandler = async ({ roomId, playerId, influence }: {
  roomId: string
  playerId: string
  influence: Influences
}) => {
  const gameState = await getGameState(roomId)

  validateRoomIdAndPlayerId(gameState, roomId, playerId)

  const player = gameState.players.find(({ id }) => id === playerId)

  if (!player.influences.length) {
    throw new GameMutationInputError('You had your chance')
  }

  if (!gameState.pendingBlockChallenge) {
    throw new GameMutationInputError('You can\'t choose a challenge response right now')
  }

  if (!player.influences.includes(influence)) {
    throw new GameMutationInputError('You don\'t have that influence')
  }

  if (influence === gameState.pendingBlock.claimedInfluence) {
    await mutateGameState(roomId, (state) => {
      const challengePlayer = state.players.find(({ name }) => name === state.pendingBlockChallenge.sourcePlayer)
      promptPlayerToLoseInfluence(state, challengePlayer.name)
      revealAndReplaceInfluence(state, state.pendingBlock.sourcePlayer, influence)
      logEvent(state, `${state.pendingBlock.sourcePlayer} successfully blocked ${state.turnPlayer}`)
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

  return { roomId, playerId }
}

export const loseInfluencesHandler = async ({ roomId, playerId, influences }: {
  roomId: string
  playerId: string
  influences: Influences[]
}) => {
  const gameState = await getGameState(roomId)

  validateRoomIdAndPlayerId(gameState, roomId, playerId)

  const player = gameState.players.find(({ id }) => id === playerId)

  if (!player.influences.length) {
    throw new GameMutationInputError('You had your chance')
  }

  const pendingInfluenceLossCount = gameState.pendingInfluenceLoss[player.name]?.length ?? 0
  if (influences.length > gameState.pendingInfluenceLoss[player.name]?.length) {
    throw new GameMutationInputError(`You can't lose ${pendingInfluenceLossCount} influence${pendingInfluenceLossCount === 1 ? '' : 's'} right now`)
  }

  await mutateGameState(roomId, (state) => {
    const losingPlayer = state.players.find(({ id }) => id === playerId)
    influences.forEach((influence) => {
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
  })

  return { roomId, playerId }
}
