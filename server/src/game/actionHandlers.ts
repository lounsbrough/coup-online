import { v4 as uuidv4 } from 'uuid'
import { GameMutationInputError } from "../utilities/errors"
import { ActionAttributes, Actions, GameState, InfluenceAttributes, Influences, Responses } from "../../../shared/types/game"
import { getActionMessage } from '../../../shared/utilities/message'
import { getGameState, logEvent, mutateGameState } from "../utilities/gameState"
import { generateRoomId } from "../utilities/identifiers"
import { addPlayerToGame, createNewGame, killPlayerInfluence, moveTurnToNextPlayer, processPendingAction, promptPlayerToLoseInfluence, removePlayerFromGame, resetGame, revealAndReplaceInfluence, startGame } from "./logic"

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
      if (state.players.length >= 6) {
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

      addPlayerToGame(state, playerId, playerName)
    })
  }

  return { roomId, playerId }
}

export const addAiPlayerHandler = async ({ roomId, playerId, playerName }: {
  roomId: string
  playerId: string
  playerName: string
}) => {
  const gameState = await getGameState(roomId)

  getPlayerInRoom(gameState, playerId)

  await mutateGameState(gameState, (state) => {
    if (state.players.length >= 6) {
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

    const aiPlayerId = uuidv4()

    addPlayerToGame(state, aiPlayerId, playerName, true)
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
  const noHumanOpponents = gameState.players.filter(({ ai }) => !ai).length === 1

  if (gameIsOver || noHumanOpponents) {
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

  const resetPlayer = getPlayerInRoom(gameState, playerId)

  if (!gameState.isStarted) {
    throw new GameMutationInputError('Game is not started')
  }

  const gameIsOver = gameState.players.filter(({ influences }) => influences.length).length === 1
  if (!gameIsOver) {
    const noHumanOpponents = gameState.players.filter(({ ai }) => !ai).length === 1
    const pendingResetFromOtherPlayer = resetPlayer.influences.length
      && gameState.resetGameRequest
      && gameState.resetGameRequest?.player !== resetPlayer.name
    if (!noHumanOpponents && !pendingResetFromOtherPlayer) {
      throw new GameMutationInputError('Current game is in progress')
    }
  }

  await resetGame(roomId)

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

  await startGame(gameState)

  return { roomId, playerId }
}

export const actionHandler = async ({ roomId, playerId, action, targetPlayer }: {
  roomId: string
  playerId: string
  action: Actions,
  targetPlayer?: string
}) => {
  const gameState = await getGameState(roomId)

  const player = getPlayerInRoom(gameState, playerId)

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

        coupingPlayer.coins -= ActionAttributes.Coup.coinsRequired!
        logEvent(state, getActionMessage({
          action,
          tense: 'complete',
          actionPlayer: player.name,
          targetPlayer
        }))
        promptPlayerToLoseInfluence(state, targetPlayer)
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

        incomePlayer.coins += 1
        moveTurnToNextPlayer(state)
        logEvent(state, getActionMessage({
          action,
          tense: 'complete',
          actionPlayer: player.name
        }))
      })
    }
  } else {
    await mutateGameState(gameState, (state) => {
      if (state.pendingAction) {
        throw new GameMutationInputError('There is already a pending action')
      }

      state.pendingAction = {
        action: action,
        pendingPlayers: state.players.reduce((agg: string[], cur) => {
          if (cur.influences.length && cur.name !== player.name) {
            agg.push(cur.name)
          }
          return agg
        }, []),
        ...(targetPlayer && { targetPlayer }),
        claimConfirmed: false
      }
      logEvent(state, getActionMessage({
        action,
        tense: 'pending',
        actionPlayer: player.name,
        targetPlayer
      }))
    })
  }

  return { roomId, playerId }
}

export const actionResponseHandler = async ({ roomId, playerId, response, claimedInfluence }: {
  roomId: string
  playerId: string
  response: Responses,
  claimedInfluence?: Influences
}) => {
  const gameState = await getGameState(roomId)

  const player = getPlayerInRoom(gameState, playerId)

  if (!player.influences.length) {
    throw new GameMutationInputError('You had your chance')
  }

  if (!gameState.pendingAction
    || gameState.pendingActionChallenge
    || !gameState.pendingAction.pendingPlayers.includes(player.name)) {
    throw new GameMutationInputError('You can\'t choose an action response right now')
  }

  if (response === Responses.Pass) {
    await mutateGameState(gameState, (state) => {
      if (!state.pendingAction) {
        throw new GameMutationInputError('Unable to find pending action')
      }

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
    }

    await mutateGameState(gameState, (state) => {
      state.pendingActionChallenge = {
        sourcePlayer: player.name
      }
      logEvent(state, `${player.name} is challenging ${state.turnPlayer}`)
    })
  } else if (response === Responses.Block) {
    if (!claimedInfluence) {
      throw new GameMutationInputError('claimedInfluence is required when blocking')
    }

    if (InfluenceAttributes[claimedInfluence as Influences].legalBlock !== gameState.pendingAction.action) {
      throw new GameMutationInputError('claimedInfluence can\'t block this action')
    }

    if (gameState.pendingAction.targetPlayer &&
      player.name !== gameState.pendingAction.targetPlayer
    ) {
      throw new GameMutationInputError(`You are not the target of the pending action`)
    }

    await mutateGameState(gameState, (state) => {
      if (!state.pendingAction) {
        throw new GameMutationInputError('Unable to find pending action')
      }

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

  const player = getPlayerInRoom(gameState, playerId)

  if (!player.influences.length) {
    throw new GameMutationInputError('You had your chance')
  }

  if (!gameState.pendingAction || !gameState.pendingActionChallenge || gameState.turnPlayer !== player.name) {
    throw new GameMutationInputError('You can\'t choose a challenge response right now')
  }

  if (!player.influences.includes(influence)) {
    throw new GameMutationInputError('You don\'t have that influence')
  }

  if (InfluenceAttributes[influence as Influences].legalAction === gameState.pendingAction.action) {
    await mutateGameState(gameState, (state) => {
      if (!state.pendingAction || !state.pendingActionChallenge) {
        throw new GameMutationInputError('Unable to find pending action or pending action challenge')
      }

      const challengePlayer = state.players.find(({ name }) => name === state.pendingActionChallenge!.sourcePlayer)

      if (!state.turnPlayer || !challengePlayer) {
        throw new GameMutationInputError('Unable to find turn player or challenge player')
      }

      revealAndReplaceInfluence(state, state.turnPlayer, influence)
      logEvent(state, `${challengePlayer.name} failed to challenge ${state.turnPlayer}`)
      promptPlayerToLoseInfluence(state, challengePlayer.name)
      delete state.pendingActionChallenge
      state.pendingAction.claimConfirmed = true
      if (state.pendingAction.targetPlayer) {
        const targetPlayer = gameState.players.find(({ name }) => name === state.pendingAction!.targetPlayer)

        if (!targetPlayer) {
          throw new GameMutationInputError('Unable to find target player')
        }

        if (targetPlayer.influences.length > 1 - (state.pendingInfluenceLoss[targetPlayer.name]?.length ?? 0)) {
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
    await mutateGameState(gameState, (state) => {
      const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer)
      const challengePlayer = state.players.find(({ name }) => name === state.pendingActionChallenge?.sourcePlayer)

      if (!actionPlayer || !challengePlayer) {
        throw new GameMutationInputError('Unable to find action player or challenge player')
      }

      logEvent(state, `${challengePlayer.name} successfully challenged ${state.turnPlayer}`)
      killPlayerInfluence(state, actionPlayer.name, influence)
      moveTurnToNextPlayer(state)
      delete state.pendingActionChallenge
      delete state.pendingAction
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

  const player = getPlayerInRoom(gameState, playerId)

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
    await mutateGameState(gameState, (state) => {
      const blockPlayer = state.players.find(({ name }) => name === state.pendingBlock?.sourcePlayer)

      if (!blockPlayer) {
        throw new GameMutationInputError('Unable to find blocking player')
      }

      logEvent(state, `${player.name} is challenging ${blockPlayer.name}`)
      state.pendingBlockChallenge = { sourcePlayer: player.name }
    })
  } else if (response === Responses.Pass) {
    await mutateGameState(gameState, (state) => {
      if (!state.pendingAction || !state.pendingBlock) {
        throw new GameMutationInputError('Unable to find pending action or pending block')
      }

      if (state.pendingBlock.pendingPlayers.length === 1) {
        const blockPlayer = state.players.find(({ name }) => name === state.pendingBlock?.sourcePlayer)

        if (!blockPlayer) {
          throw new GameMutationInputError('Unable to find blocking player')
        }

        logEvent(state, `${blockPlayer.name} successfully blocked ${state.turnPlayer}`)
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

  const player = getPlayerInRoom(gameState, playerId)

  if (!player.influences.length) {
    throw new GameMutationInputError('You had your chance')
  }

  if (!gameState.pendingBlockChallenge || gameState.pendingBlock?.sourcePlayer !== player.name) {
    throw new GameMutationInputError('You can\'t choose a challenge response right now')
  }

  if (!player.influences.includes(influence)) {
    throw new GameMutationInputError('You don\'t have that influence')
  }

  if (influence === gameState.pendingBlock.claimedInfluence) {
    await mutateGameState(gameState, (state) => {
      if (!state.pendingAction || !state.pendingBlock) {
        throw new GameMutationInputError('Unable to find pending action or pending block')
      }

      const challengePlayer = state.players.find(({ name }) => name === state.pendingBlockChallenge?.sourcePlayer)

      if (!challengePlayer) {
        throw new GameMutationInputError('Unable to find challenging player')
      }

      revealAndReplaceInfluence(state, state.pendingBlock.sourcePlayer, influence)
      logEvent(state, `${state.pendingBlock.sourcePlayer} successfully blocked ${state.turnPlayer}`)
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
      const blockPlayer = state.players.find(({ name }) => name === state.pendingBlock?.sourcePlayer)

      if (!blockPlayer) {
        throw new GameMutationInputError('Unable to find blocking player')
      }

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
