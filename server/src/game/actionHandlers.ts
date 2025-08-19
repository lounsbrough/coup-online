import crypto from 'crypto'
import { DifferentPlayerNameError, GameInProgressError, GameNeedsAtLeast2PlayersToStartError, GameNotInProgressError, GameOverError, InsufficientCoinsError, InvalidActionAt10CoinsError, NoDeadInfluencesError, YouAreDeadError, PlayerNotInGameError, ReviveNotAllowedInGameError, RoomAlreadyHasPlayerError, RoomIsFullError, TargetPlayerNotAllowedForActionError, TargetPlayerRequiredForActionError, UnableToFindPlayerError, UnableToForfeitError, TargetPlayerIsSelfError, ActionNotCurrentlyAllowedError, MessageDoesNotExistError, MessageIsNotYoursError, MissingInfluenceError, BlockMayNotBeBlockedError, StateChangedSinceValidationError, ClaimedInfluenceAlreadyConfirmedError, ActionNotChallengeableError, ClaimedInfluenceRequiredError, ClaimedInfluenceInvalidError } from "../utilities/errors"
import { ActionAttributes, Actions, AiPersonality, EventMessages, GameSettings, GameState, InfluenceAttributes, Influences, Responses } from "../../../shared/types/game"
import { getGameState, getPublicGameState, logEvent, mutateGameState } from "../utilities/gameState"
import { generateRoomId } from "../utilities/identifiers"
import { addClaimedInfluence, addPlayerToGame, addUnclaimedInfluence, createNewGame, grudgeSizes, holdGrudge, humanOpponentsRemain, killPlayerInfluence, moveTurnToNextPlayer, processPendingAction, promptPlayerToLoseInfluence, removeClaimedInfluence, removePlayerFromGame, resetGame, revealAndReplaceInfluence, startGame } from "./logic"
import { canPlayerChooseAction, canPlayerChooseActionChallengeResponse, canPlayerChooseActionResponse, canPlayerChooseBlockChallengeResponse, canPlayerChooseBlockResponse } from '../../../shared/game/logic'
import { MAX_PLAYER_COUNT } from '../../../shared/helpers/playerCount'
import { decideAction, decideActionChallengeResponse, decideActionResponse, decideBlockChallengeResponse, decideBlockResponse, decideInfluencesToLose } from './ai'
import { AvailableLanguageCode } from '../../../shared/i18n/availableLanguages'

const getPlayerInRoom = ({ gameState, playerId }: {
  gameState: GameState
  playerId: string
}) => {
  const player = gameState.players.find(({ id }) => id === playerId)

  if (!player) throw new PlayerNotInGameError()

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
          throw new DifferentPlayerNameError(player.name)
        }

        const oldPlayer = state.players.find((player) => player.id === playerId)
        if (!oldPlayer) {
          throw new UnableToFindPlayerError()
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
        throw new RoomIsFullError(roomId)
      }

      if (state.isStarted) {
        throw new GameInProgressError()
      }

      if (state.players.some((existingPlayer) =>
        existingPlayer.name.toUpperCase() === playerName.toUpperCase()
      )) {
        throw new RoomAlreadyHasPlayerError(playerName)
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

  getPlayerInRoom({ gameState, playerId })

  await mutateGameState(gameState, (state) => {
    if (state.players.length >= MAX_PLAYER_COUNT) {
      throw new RoomIsFullError(roomId)
    }

    if (state.isStarted) {
      throw new GameInProgressError()
    }

    if (state.players.some((existingPlayer) =>
      existingPlayer.name.toUpperCase() === playerName.toUpperCase()
    )) {
      throw new RoomAlreadyHasPlayerError(playerName)
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

  getPlayerInRoom({ gameState, playerId })

  if (gameState.isStarted) {
    throw new GameInProgressError()
  }

  const playerToRemove = gameState.players.find((player) => player.name === playerName)

  if (!playerToRemove) {
    throw new PlayerNotInGameError()
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

  const player = getPlayerInRoom({ gameState, playerId })

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

  getPlayerInRoom({ gameState, playerId })

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

  const player = getPlayerInRoom({ gameState, playerId })

  if (!gameState.isStarted) {
    throw new GameNotInProgressError()
  }

  const gameIsOver = gameState.players.filter(({ influences }) => influences.length).length === 1
  if (!gameIsOver) {
    const pendingResetFromOtherPlayer = player.influences.length
      && gameState.resetGameRequest
      && gameState.resetGameRequest?.player !== player.name
    if (humanOpponentsRemain(gameState, player) && !pendingResetFromOtherPlayer) {
      throw new GameInProgressError()
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

  const player = getPlayerInRoom({ gameState, playerId })

  if (!gameState.isStarted) {
    throw new GameNotInProgressError()
  }

  if (gameState.players.filter(({ influences }) => influences.length).length === 1) {
    throw new GameOverError()
  }

  if (!player.influences.length) {
    throw new YouAreDeadError()
  }

  await mutateGameState(gameState, (state) => {
    const playerToForfeit = state.players.find(({ id }) => id === playerId)
    if (!playerToForfeit) {
      throw new UnableToFindPlayerError()
    }

    if (gameState.pendingInfluenceLoss[playerToForfeit.name]?.length
      || state.turnPlayer === playerToForfeit.name && state.pendingAction
      || state.pendingAction?.targetPlayer === playerToForfeit.name
      || state.pendingActionChallenge?.sourcePlayer === playerToForfeit.name
      || state.pendingBlock?.sourcePlayer === playerToForfeit.name
      || state.pendingBlockChallenge?.sourcePlayer === playerToForfeit.name) {
      throw new UnableToForfeitError()
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

  getPlayerInRoom({ gameState, playerId })

  if (gameState.players.length < 2) {
    throw new GameNeedsAtLeast2PlayersToStartError()
  }

  if (gameState.isStarted) {
    throw new GameInProgressError()
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

  const player = getPlayerInRoom({ gameState, playerId })

  if (!player.influences.length) {
    throw new YouAreDeadError()
  }

  if ((ActionAttributes[action].coinsRequired ?? 0) > player.coins) {
    throw new InsufficientCoinsError()
  }

  if (player.coins >= 10 && ![Actions.Coup, Actions.Revive].includes(action)) {
    throw new InvalidActionAt10CoinsError()
  }

  if (action === Actions.Revive) {
    if (!gameState.settings.allowRevive) {
      throw new ReviveNotAllowedInGameError()
    }
    if (!player.deadInfluences.length) {
      throw new NoDeadInfluencesError()
    }
  }

  if (targetPlayer && !gameState.players.some((player) => player.name === targetPlayer)) {
    throw new UnableToFindPlayerError()
  }

  if (ActionAttributes[action].requiresTarget && !targetPlayer) {
    throw new TargetPlayerRequiredForActionError()
  }

  if (!ActionAttributes[action].requiresTarget && targetPlayer) {
    throw new TargetPlayerNotAllowedForActionError()
  }

  if (targetPlayer === player.name) {
    throw new TargetPlayerIsSelfError()
  }

  if (!ActionAttributes[action].blockable && !ActionAttributes[action].challengeable) {
    if (action === Actions.Coup) {
      await mutateGameState(gameState, (state) => {
        if (!targetPlayer) {
          throw new TargetPlayerRequiredForActionError()
        }

        const coupingPlayer = state.players.find(({ id }) => id === playerId)

        if (!coupingPlayer) {
          throw new UnableToFindPlayerError()
        }

        if (coupingPlayer.coins !== player.coins) {
          throw new StateChangedSinceValidationError()
        }

        if (!canPlayerChooseAction(getPublicGameState({ gameState: state, playerId: coupingPlayer.id }))) {
          throw new ActionNotCurrentlyAllowedError()
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
          throw new UnableToFindPlayerError()
        }

        if (revivePlayer.coins !== player.coins) {
          throw new StateChangedSinceValidationError()
        }

        if (!canPlayerChooseAction(getPublicGameState({ gameState: state, playerId: revivePlayer.id }))) {
          throw new ActionNotCurrentlyAllowedError()
        }

        revivePlayer.coins -= 10
        const influenceToRevive = revivePlayer.deadInfluences.pop()
        if (!influenceToRevive) {
          throw new NoDeadInfluencesError()
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
          throw new UnableToFindPlayerError()
        }

        if (incomePlayer.coins !== player.coins) {
          throw new StateChangedSinceValidationError()
        }

        if (!canPlayerChooseAction(getPublicGameState({ gameState: state, playerId: incomePlayer.id }))) {
          throw new ActionNotCurrentlyAllowedError()
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
        throw new ActionNotCurrentlyAllowedError()
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
    throw new ActionNotCurrentlyAllowedError()
  }

  const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer)
  const respondingPlayer = state.players.find(({ name }) => name === playerName)

  if (!actionPlayer || !respondingPlayer) {
    throw new UnableToFindPlayerError()
  }

  if (state.pendingAction.action === Actions.ForeignAid) {
    addUnclaimedInfluence(respondingPlayer, Influences.Duke)
  }

  if (state.pendingAction.targetPlayer === playerName) {
    const targetPlayer = state.players.find(({ name }) => name === state.pendingAction?.targetPlayer)

    if (!targetPlayer) {
      throw new UnableToFindPlayerError()
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

  const player = getPlayerInRoom({ gameState, playerId })

  if (!player.influences.length) {
    throw new YouAreDeadError()
  }

  if (!canPlayerChooseActionResponse(getPublicGameState({ gameState, playerId: player.id }))) {
    throw new ActionNotCurrentlyAllowedError()
  }

  if (response === Responses.Pass) {
    await mutateGameState(gameState, (state) => {
      processPassActionResponse(state, player.name)
    })
  } else if (response === Responses.Challenge) {
    if (gameState.pendingAction!.claimConfirmed) {
      throw new ClaimedInfluenceAlreadyConfirmedError()
    }

    if (!ActionAttributes[gameState.pendingAction!.action].challengeable) {
      throw new ActionNotChallengeableError()
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
      throw new ClaimedInfluenceRequiredError()
    }

    if (InfluenceAttributes[claimedInfluence as Influences].legalBlock !== gameState.pendingAction!.action) {
      throw new ClaimedInfluenceInvalidError()
    }

    if (gameState.pendingAction!.targetPlayer &&
      player.name !== gameState.pendingAction!.targetPlayer
    ) {
      throw new ActionNotCurrentlyAllowedError()
    }

    await mutateGameState(gameState, (state) => {
      if (!state.pendingAction) {
        throw new ActionNotCurrentlyAllowedError()
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

  const player = getPlayerInRoom({ gameState, playerId })

  if (!player.influences.length) {
    throw new YouAreDeadError()
  }

  if (!canPlayerChooseActionChallengeResponse(getPublicGameState({ gameState, playerId: player.id }))) {
    throw new ActionNotCurrentlyAllowedError
  }

  if (!player.influences.includes(influence)) {
    throw new MissingInfluenceError()
  }

  if (InfluenceAttributes[influence as Influences].legalAction === gameState.pendingAction!.action) {
    await mutateGameState(gameState, (state) => {
      if (!state.pendingAction || !state.pendingActionChallenge) {
        throw new ActionNotCurrentlyAllowedError()
      }

      const challengePlayer = state.players.find(({ name }) => name === state.pendingActionChallenge!.sourcePlayer)

      if (!state.turnPlayer || !challengePlayer) {
        throw new UnableToFindPlayerError()
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
          throw new UnableToFindPlayerError()
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
        throw new UnableToFindPlayerError()
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
    throw new ActionNotCurrentlyAllowedError()
  }

  if (state.pendingBlock.pendingPlayers.size === 1) {
    const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer)
    const blockPlayer = state.players.find(({ name }) => name === state.pendingBlock?.sourcePlayer)

    if (!actionPlayer || !blockPlayer) {
      throw new UnableToFindPlayerError()
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
        throw new UnableToFindPlayerError()
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

  const player = getPlayerInRoom({ gameState, playerId })

  if (!player.influences.length) {
    throw new YouAreDeadError()
  }

  if (!canPlayerChooseBlockResponse(getPublicGameState({ gameState, playerId: player.id }))) {
    throw new ActionNotCurrentlyAllowedError()
  }

  if (response === Responses.Block) {
    throw new BlockMayNotBeBlockedError()
  }

  if (response === Responses.Challenge) {
    await mutateGameState(gameState, (state) => {
      const blockPlayer = state.players.find(({ name }) => name === state.pendingBlock?.sourcePlayer)

      if (!blockPlayer) {
        throw new UnableToFindPlayerError()
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

  const player = getPlayerInRoom({ gameState, playerId })

  if (!player.influences.length) {
    throw new YouAreDeadError()
  }

  if (!canPlayerChooseBlockChallengeResponse(getPublicGameState({ gameState, playerId: player.id }))) {
    throw new ActionNotCurrentlyAllowedError()
  }

  if (!player.influences.includes(influence)) {
    throw new MissingInfluenceError()
  }

  if (influence === gameState.pendingBlock!.claimedInfluence) {
    await mutateGameState(gameState, (state) => {
      if (!state.pendingAction || !state.pendingBlock) {
        throw new ActionNotCurrentlyAllowedError()
      }

      const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer)
      const challengePlayer = state.players.find(({ name }) => name === state.pendingBlockChallenge?.sourcePlayer)

      if (!actionPlayer || !challengePlayer) {
        throw new UnableToFindPlayerError()
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
          throw new UnableToFindPlayerError()
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

      if (!actionPlayer || !blockPlayer || !challengePlayer) {
        throw new UnableToFindPlayerError()
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

  const player = getPlayerInRoom({ gameState, playerId })

  if (!player.influences.length) {
    throw new YouAreDeadError()
  }

  const influenceCounts = influences.reduce((agg, cur) => {
    agg[cur] = (agg[cur] ?? 0) + 1
    return agg
  }, {} as { [key in Influences]: number })

  if (Object.entries(influenceCounts).some(([i, count]) => player.influences.filter((pi) => pi === i).length < count)) {
    throw new MissingInfluenceError()
  }

  const pendingInfluenceLossCount = gameState.pendingInfluenceLoss[player.name]?.length ?? 0
  if (influences.length > pendingInfluenceLossCount) {
    throw new MissingInfluenceError()
  }

  await mutateGameState(gameState, (state) => {
    const losingPlayer = state.players.find(({ id }) => id === playerId)

    if (!losingPlayer) {
      throw new UnableToFindPlayerError()
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

  const player = getPlayerInRoom({ gameState, playerId })

  await mutateGameState(gameState, (state) => {
    const existingMessage = state.chatMessages.find(({ id }) => id === messageId)

    if (existingMessage && existingMessage?.from !== player.name) {
      throw new MessageIsNotYoursError()
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

  const player = getPlayerInRoom({ gameState, playerId })

  await mutateGameState(gameState, (state) => {
    const existingMessage = state.chatMessages.find(({ id }) => id === messageId)

    if (!existingMessage) {
      throw new MessageDoesNotExistError()
    }

    if (existingMessage.from !== player.name) {
      throw new MessageIsNotYoursError()
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
  language: AvailableLanguageCode;
}) => {
  const gameState = await getGameState(roomId)

  const player = getPlayerInRoom({ gameState, playerId })

  await mutateGameState(gameState, (state) => {
    const existingMessage = state.chatMessages.find(
      ({ id }) => id === messageId
    )

    if (!existingMessage) {
      throw new MessageDoesNotExistError()
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
