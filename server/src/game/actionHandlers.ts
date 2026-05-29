import crypto from 'node:crypto'
import { DifferentPlayerNameError, GameInProgressError, GameNeedsAtLeast2PlayersToStartError, GameNotInProgressError, GameOverError, InsufficientCoinsError, InvalidActionAt10CoinsError, NoDeadInfluencesError, YouAreDeadError, PlayerNotInGameError, ReviveNotAllowedInGameError, RoomAlreadyHasPlayerError, RoomIsFullError, TargetPlayerNotAllowedForActionError, TargetPlayerRequiredForActionError, UnableToFindPlayerError, UnableToForfeitError, TargetPlayerIsSelfError, CannotBlockSameFactionError, CannotTargetSameFactionError, ActionNotCurrentlyAllowedError, MessageDoesNotExistError, MessageIsNotYoursError, MissingInfluenceError, BlockMayNotBeBlockedError, StateChangedSinceValidationError, ClaimedInfluenceAlreadyConfirmedError, ActionNotChallengeableError, ClaimedInfluenceRequiredError, ClaimedInfluenceInvalidError, RoomIdAlreadyExistsError, SpeedRoundTimerExpiredError } from "../utilities/errors"
import { ActionAttributes, Actions, AiPersonality, EventMessages, Factions, GameSettings, GameState, InfluenceAttributes, Influences, PlayerActions, Responses } from "../../../shared/types/game"
import { drawCardFromDeck, getGameState, getPublicGameState, logEvent, logForcedMove, mutateGameState, shuffleDeck } from "../utilities/gameState"
import { generateRoomId } from "../utilities/identifiers"
import { getValue } from '../utilities/storage'
import { shuffle } from '../utilities/array'
import { addClaimedInfluence, addPlayerToGame, addUnclaimedInfluence, createNewGame, grudgeSizes, holdGrudge, humanOpponentsRemain, isSpeedRoundTimerExpired, killPlayerInfluence, moveTurnToNextPlayer, processPendingAction, promptPlayerToLoseInfluence, removeClaimedInfluence, removePlayerFromGame, resetGame, revealAndReplaceInfluence, startGame } from "./logic"
import { canInfluenceLegallyPerformAction, canPlayerChooseAction, canPlayerChooseActionChallengeResponse, canPlayerChooseActionResponse, canPlayerChooseBlockChallengeResponse, canPlayerChooseBlockResponse, getInfluenceRequiredForAction, getInfluencesForGame, sameActiveFaction } from '../../../shared/game/logic'
import { getPlayerSuggestedMove } from './ai'
import { MAX_PLAYER_COUNT } from '../../../shared/helpers/playerCount'
import { AvailableLanguageCode } from '../../../shared/i18n/availableLanguages'
import { recordBluff, recordChallengeMade, recordCoup, recordInfluenceKill, recordInfluenceClaim, recordSuccessfulBluff, recordSuccessfulChallenge } from './statsAccumulator'
import { recordTimelineAction, recordTimelineActionChallenge, recordTimelineBlock, recordTimelineBlockChallenge } from './timelineRecorder'

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
  const gameState = await getGameState(roomId)
  return { roomId, playerId, gameState }
}

export const createGameHandler = async ({ playerId, playerName, settings, uid, photoURL }: {
  playerId: string
  playerName: string
  settings: GameSettings
  uid?: string
  photoURL?: string
}) => {
  const roomId = generateRoomId()

  if (await getValue(roomId.toUpperCase())) {
    throw new RoomIdAlreadyExistsError(roomId)
  }

  const gameState = await createNewGame(roomId, playerId, playerName, settings, uid, photoURL)

  return { roomId, playerId, gameState }
}

export const joinGameHandler = async ({ roomId, playerId, playerName, uid, photoURL }: {
  roomId: string
  playerId: string
  playerName: string
  uid?: string
  photoURL?: string
}) => {
  const gameState = await getGameState(roomId)

  const player = gameState.players.find((player) => player.id === playerId)
  let latestState: GameState = gameState

  if (player) {
    if (player.name.toUpperCase() !== playerName.toUpperCase()) {
      latestState = await mutateGameState(latestState, (state) => {
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
    // Update uid/photoURL if the player logs in after joining
    if (uid && !player.uid) {
      latestState = await mutateGameState(latestState, (state) => {
        const existingPlayer = state.players.find((p) => p.id === playerId)
        if (existingPlayer) {
          existingPlayer.uid = uid
          if (photoURL) existingPlayer.photoURL = photoURL
        }
      })
    }
  } else {
    latestState = await mutateGameState(gameState, (state) => {
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

      addPlayerToGame({ state, playerId, playerName, ...(uid ? { uid } : {}), ...(photoURL ? { photoURL } : {}) })
    })
  }

  return { roomId, playerId, gameState: latestState }
}

export const addAiPlayerHandler = async ({ roomId, playerId, playerName, personality }: {
  roomId: string
  playerId: string
  playerName: string
  personality?: AiPersonality
}) => {
  const gameState = await getGameState(roomId)

  getPlayerInRoom({ gameState, playerId })

  const updatedState = await mutateGameState(gameState, (state) => {
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

  return { roomId, playerId, gameState: updatedState }
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

  const updatedState = await mutateGameState(gameState, (state) => {
    removePlayerFromGame(state, playerName)
  })

  return { roomId, playerId, gameState: updatedState }
}

export const resetGameRequestHandler = async ({ roomId, playerId }: {
  roomId: string
  playerId: string
}) => {
  const gameState = await getGameState(roomId)

  const player = getPlayerInRoom({ gameState, playerId })

  const gameIsOver = gameState.players.filter(({ influences }) => influences.length).length === 1

  let latestState: GameState
  if (gameIsOver || !humanOpponentsRemain(gameState, player)) {
    latestState = await resetGame(roomId)
  } else {
    latestState = await mutateGameState(gameState, (state) => {
      if (state.isStarted && !state.resetGameRequest) {
        state.resetGameRequest = { player: player.name }
      }
    })
  }

  return { roomId, playerId, gameState: latestState }
}

export const resetGameRequestCancelHandler = async ({ roomId, playerId }: {
  roomId: string
  playerId: string
}) => {
  const gameState = await getGameState(roomId)

  getPlayerInRoom({ gameState, playerId })

  const updatedState = await mutateGameState(gameState, (state) => {
    delete state.resetGameRequest
  })

  return { roomId, playerId, gameState: updatedState }
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

  const updatedState = await resetGame(roomId)

  return { roomId, playerId, gameState: updatedState }
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

  const updatedState = await mutateGameState(gameState, (state) => {
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

  return { roomId, playerId, gameState: updatedState }
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

  const updatedState = await mutateGameState(gameState, startGame)

  return { roomId, playerId, gameState: updatedState }
}

export const checkAutoMoveHandler = async ({ roomId, playerId }: {
  roomId: string
  playerId: string
}) => {
  const gameState = await getGameState(roomId)

  const unchangedResponse = { roomId, playerId, stateUnchanged: true, gameState }
  const changedResponse = (state: GameState) => ({ roomId, playerId, gameState: state })

  const remainingPlayers = gameState.players.filter(({ influences }) => influences.length)
  const playersForAutoMove = []
  let isForcedMove = false
  if (isSpeedRoundTimerExpired(gameState)) {
    playersForAutoMove.push(...shuffle(remainingPlayers))
    isForcedMove = true
  } else {
    // AI players move after a short pause
    const timeForMachinesToPonderLifeChoices = gameState.settings.aiMoveDelayMs ?? 500
    if (timeForMachinesToPonderLifeChoices && Date.now() < gameState.lastEventTimestamp.getTime() + timeForMachinesToPonderLifeChoices) {
      return unchangedResponse
    }
    playersForAutoMove.push(...remainingPlayers.filter(({ ai }) => ai))
  }

  for (const playerForAutoMove of playersForAutoMove) {
    const suggestedMove = await getPlayerSuggestedMove({ roomId, playerId: playerForAutoMove.id })
    if (!suggestedMove) continue
    const [move, params] = suggestedMove

    let result: { gameState: GameState }
    if (move === PlayerActions.loseInfluences) {
      result = await loseInfluencesHandler({ ...(params as Parameters<typeof loseInfluencesHandler>[0]), isForcedMove })
    } else if (move === PlayerActions.action) {
      result = await actionHandler({ ...(params as Parameters<typeof actionHandler>[0]), isForcedMove })
    } else if (move === PlayerActions.actionResponse) {
      result = await actionResponseHandler({ ...(params as Parameters<typeof actionResponseHandler>[0]), isForcedMove })
    } else if (move === PlayerActions.actionChallengeResponse) {
      result = await actionChallengeResponseHandler({ ...(params as Parameters<typeof actionChallengeResponseHandler>[0]), isForcedMove })
    } else if (move === PlayerActions.blockResponse) {
      result = await blockResponseHandler({ ...(params as Parameters<typeof blockResponseHandler>[0]), isForcedMove })
    } else if (move === PlayerActions.blockChallengeResponse) {
      result = await blockChallengeResponseHandler({ ...(params as Parameters<typeof blockChallengeResponseHandler>[0]), isForcedMove })
    } else if (move === PlayerActions.revealForExamine) {
      result = await revealForExamineHandler(params as Parameters<typeof revealForExamineHandler>[0])
    } else if (move === PlayerActions.examineDecision) {
      result = await examineDecisionHandler(params as Parameters<typeof examineDecisionHandler>[0])
    } else {
      throw new ActionNotCurrentlyAllowedError()
    }

    return changedResponse(result.gameState)
  }

  return unchangedResponse
}

const enforceSpeedRoundTimer = (gameState: GameState, isForcedMove?: boolean) => {
  if (!isForcedMove && isSpeedRoundTimerExpired(gameState)) {
    throw new SpeedRoundTimerExpiredError()
  }
}

export const actionHandler = async ({ roomId, playerId, action, targetPlayer, isForcedMove }: {
  roomId: string
  playerId: string
  action: Actions
  targetPlayer?: string
  isForcedMove?: boolean
}) => {
  const gameState = await getGameState(roomId)

  enforceSpeedRoundTimer(gameState, isForcedMove)

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

  if ((action === Actions.Convert || action === Actions.Embezzle) && !gameState.settings.enableReformation) {
    throw new ActionNotCurrentlyAllowedError()
  }

  if (action === Actions.Examine && !gameState.settings.useInquisitor) {
    throw new ActionNotCurrentlyAllowedError()
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

  if (targetPlayer === player.name && action !== Actions.Convert) {
    throw new TargetPlayerIsSelfError()
  }

  if (targetPlayer && action !== Actions.Convert) {
    if (sameActiveFaction(gameState, player.name, targetPlayer)) {
      throw new CannotTargetSameFactionError()
    }
  }

  let latestState: GameState = gameState
  if (!ActionAttributes[action].blockable && !ActionAttributes[action].challengeable) {
    if (action === Actions.Coup) {
      latestState = await mutateGameState(gameState, (state) => {
        if (isForcedMove) logForcedMove(state, player)

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
        recordCoup(state, coupingPlayer.name)
        recordInfluenceKill(state, coupingPlayer.name, targetPlayer)
        promptPlayerToLoseInfluence(state, targetPlayer)
      })
    } else if (action === Actions.Revive) {
      latestState = await mutateGameState(gameState, (state) => {
        if (isForcedMove) logForcedMove(state, player)

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
      latestState = await mutateGameState(gameState, (state) => {
        if (isForcedMove) logForcedMove(state, player)

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
    } else if (action === Actions.Convert) {
      latestState = await mutateGameState(gameState, (state) => {
        if (isForcedMove) logForcedMove(state, player)

        const convertingPlayer = state.players.find(({ id }) => id === playerId)

        if (!convertingPlayer) {
          throw new UnableToFindPlayerError()
        }

        if (convertingPlayer.coins !== player.coins) {
          throw new StateChangedSinceValidationError()
        }

        if (!canPlayerChooseAction(getPublicGameState({ gameState: state, playerId: convertingPlayer.id }))) {
          throw new ActionNotCurrentlyAllowedError()
        }

        if (!targetPlayer) {
          throw new TargetPlayerRequiredForActionError()
        }

        const target = state.players.find((p) => p.name === targetPlayer)
        if (!target) {
          throw new UnableToFindPlayerError()
        }

        const coinsRequired = target.id === convertingPlayer.id ? 1 : 2
        if (convertingPlayer.coins < coinsRequired) {
          throw new InsufficientCoinsError()
        }
        convertingPlayer.coins -= coinsRequired
        state.treasury += coinsRequired
        target.faction = target.faction === Factions.Loyalist ? Factions.Reformist : Factions.Loyalist

        moveTurnToNextPlayer(state)
        logEvent(state, {
          event: EventMessages.ActionProcessed,
          action,
          primaryPlayer: player.name,
          secondaryPlayer: targetPlayer
        })
      })
    }
  } else {
    latestState = await mutateGameState(gameState, (state) => {
      if (isForcedMove) logForcedMove(state, player)

      if (!canPlayerChooseAction(getPublicGameState({ gameState: state, playerId: player.id }))) {
        throw new ActionNotCurrentlyAllowedError()
      }

      state.pendingAction = {
        action,
        pendingPlayers: state.players.reduce((agg, cur) => {
          if (cur.influences.length && cur.name !== player.name) {
            const canChallenge = ActionAttributes[action].challengeable
            const canBlock = ActionAttributes[action].blockable
              && (ActionAttributes[action].requiresTarget || !sameActiveFaction(state, cur.name, player.name))
            if (canChallenge || canBlock) {
              agg.add(cur.name)
            }
          }
          return agg
        }, new Set<string>()),
        ...(targetPlayer && { targetPlayer }),
        claimConfirmed: false
      }

      // Track influence claim and bluff stats
      const requiredInfluence = getInfluenceRequiredForAction(action, state.settings)
      if (requiredInfluence) {
        recordInfluenceClaim(state, player.name, requiredInfluence)
        const actualPlayer = state.players.find(({ id }) => id === player.id)
        if (actualPlayer && !actualPlayer.influences.includes(requiredInfluence)) {
          recordBluff(state, player.name)
        }
      }

      recordTimelineAction(state, player.name, action, targetPlayer)

      if (!state.pendingAction.pendingPlayers.size) {
        processPendingAction(state)
      } else {
        logEvent(state, {
          event: EventMessages.ActionPending,
          action,
          primaryPlayer: player.name,
          ...(targetPlayer && { secondaryPlayer: targetPlayer })
        })
      }
    })
  }

  return { roomId, playerId, gameState: latestState }
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

  if (state.pendingAction.pendingPlayers.size > 1) {
    state.pendingAction.pendingPlayers.delete(playerName)
    return { updateLastEventTimestamp: false }
  }

  // Everyone passed — if the action player was bluffing, the bluff succeeded
  const claimedInfluence = getInfluenceRequiredForAction(state.pendingAction.action, state.settings)
  if (claimedInfluence) {
    addClaimedInfluence(actionPlayer, claimedInfluence)
    if (!state.pendingAction.claimConfirmed && !actionPlayer.influences.includes(claimedInfluence)) {
      recordSuccessfulBluff(state, actionPlayer.name)
    }
  }
  processPendingAction(state)
}

export const actionResponseHandler = async ({ roomId, playerId, response, claimedInfluence, isForcedMove }: {
  roomId: string
  playerId: string
  response: Responses
  claimedInfluence?: Influences
  isForcedMove?: boolean
}) => {
  const gameState = await getGameState(roomId)

  enforceSpeedRoundTimer(gameState, isForcedMove)

  const player = getPlayerInRoom({ gameState, playerId })

  if (!player.influences.length) {
    throw new YouAreDeadError()
  }

  if (!canPlayerChooseActionResponse(getPublicGameState({ gameState, playerId: player.id }))) {
    throw new ActionNotCurrentlyAllowedError()
  }

  let latestState: GameState
  if (response === Responses.Pass) {
    latestState = await mutateGameState(gameState, (state) => {
      if (isForcedMove) logForcedMove(state, player)

      return processPassActionResponse(state, player.name)
    })
  } else if (response === Responses.Challenge) {
    if (gameState.pendingAction!.claimConfirmed) {
      throw new ClaimedInfluenceAlreadyConfirmedError()
    }

    if (!ActionAttributes[gameState.pendingAction!.action].challengeable) {
      throw new ActionNotChallengeableError()
    }

    latestState = await mutateGameState(gameState, (state) => {
      if (isForcedMove) logForcedMove(state, player)

      recordChallengeMade(state, player.name)

      if (state.pendingAction!.action === Actions.Embezzle) {
        const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer)
        if (!actionPlayer) {
          throw new UnableToFindPlayerError()
        }

        const hasDuke = actionPlayer.influences.includes(Influences.Duke)
        if (hasDuke) {
          logEvent(state, {
            event: EventMessages.ChallengeSuccessful,
            primaryPlayer: player.name,
            secondaryPlayer: state.turnPlayer!
          })
          recordSuccessfulChallenge(state, player.name)
          recordInfluenceKill(state, player.name, state.turnPlayer!)
          recordTimelineActionChallenge(state, player.name, true)
          holdGrudge({ state, offended: state.turnPlayer!, offender: player.name, weight: grudgeSizes[Responses.Challenge] })
          delete state.pendingAction
          promptPlayerToLoseInfluence(state, actionPlayer.name)
        } else {
          logEvent(state, {
            event: EventMessages.ChallengeFailed,
            primaryPlayer: player.name,
            secondaryPlayer: state.turnPlayer!
          })
          recordInfluenceKill(state, state.turnPlayer!, player.name)
          recordTimelineActionChallenge(state, player.name, false)

          const revealedInfluences = [...actionPlayer.influences]
          removeClaimedInfluence(actionPlayer)
          actionPlayer.influences = []
          state.deck.push(...revealedInfluences)
          shuffleDeck(state)
          revealedInfluences.forEach((influence) => {
            logEvent(state, {
              event: EventMessages.PlayerReplacedInfluence,
              primaryPlayer: actionPlayer.name,
              influence
            })
            actionPlayer.influences.push(drawCardFromDeck(state))
          })
          promptPlayerToLoseInfluence(state, player.name)
          processPendingAction(state)
        }
      } else {
        state.pendingActionChallenge = {
          sourcePlayer: player.name
        }
        logEvent(state, {
          event: EventMessages.ChallengePending,
          primaryPlayer: player.name,
          secondaryPlayer: state.turnPlayer!
        })
      }
    })
  } else if (response === Responses.Block) {
    if (!claimedInfluence) {
      throw new ClaimedInfluenceRequiredError()
    }

    if (!InfluenceAttributes[claimedInfluence].legalBlocks.includes(gameState.pendingAction!.action)
      || !getInfluencesForGame(gameState.settings).includes(claimedInfluence)) {
      throw new ClaimedInfluenceInvalidError()
    }

    if (gameState.pendingAction!.targetPlayer &&
      player.name !== gameState.pendingAction!.targetPlayer
    ) {
      throw new ActionNotCurrentlyAllowedError()
    }

    if (sameActiveFaction(gameState, player.name, gameState.turnPlayer!)) {
      throw new CannotBlockSameFactionError()
    }

    latestState = await mutateGameState(gameState, (state) => {
      if (isForcedMove) logForcedMove(state, player)

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

      // Track block influence claim and bluff
      recordInfluenceClaim(state, player.name, claimedInfluence)
      const blockingPlayer = state.players.find(({ id }) => id === player.id)
      if (blockingPlayer && !blockingPlayer.influences.includes(claimedInfluence)) {
        recordBluff(state, player.name)
      }

      recordTimelineBlock(state, player.name, claimedInfluence)

      logEvent(state, {
        event: EventMessages.BlockPending,
        primaryPlayer: player.name,
        secondaryPlayer: state.turnPlayer!,
        influence: claimedInfluence
      })
    })
  }

  return { roomId, playerId, gameState: latestState! }
}

export const actionChallengeResponseHandler = async ({ roomId, playerId, influence, isForcedMove }: {
  roomId: string
  playerId: string
  influence: Influences
  isForcedMove?: boolean
}) => {
  const gameState = await getGameState(roomId)

  enforceSpeedRoundTimer(gameState, isForcedMove)

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

  let latestState: GameState
  if (canInfluenceLegallyPerformAction(influence, gameState.pendingAction!.action)) {
    latestState = await mutateGameState(gameState, (state) => {
      if (isForcedMove) logForcedMove(state, player)

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
        secondaryPlayer: state.turnPlayer
      })
      // Challenge failed: the action player was telling the truth
      recordInfluenceKill(state, state.turnPlayer, challengePlayer.name)
      recordTimelineActionChallenge(state, challengePlayer.name, false)
      promptPlayerToLoseInfluence(state, challengePlayer.name)
      delete state.pendingActionChallenge
      state.pendingAction.claimConfirmed = true
      if (state.pendingAction.targetPlayer && ActionAttributes[state.pendingAction.action].blockable) {
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
          if (cur.influences.length && cur.name !== state.turnPlayer
            && !sameActiveFaction(state, cur.name, state.turnPlayer!)) {
            agg.add(cur.name)
          }
          return agg
        }, new Set<string>())
        if (!state.pendingAction.pendingPlayers.size) {
          processPendingAction(state)
        }
      } else {
        processPendingAction(state)
      }
    })
  } else {
    latestState = await mutateGameState(gameState, (state) => {
      if (isForcedMove) logForcedMove(state, player)

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
      // Challenge succeeded: the action player was bluffing
      recordSuccessfulChallenge(state, challengePlayer.name)
      recordInfluenceKill(state, challengePlayer.name, state.turnPlayer!)
      recordTimelineActionChallenge(state, challengePlayer.name, true)
      const claimedInfluence = getInfluenceRequiredForAction(state.pendingAction!.action, state.settings)
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

  return { roomId, playerId, gameState: latestState }
}

export const processPassBlockResponse = (state: GameState, playerName: string) => {
  if (!state.pendingAction || !state.pendingBlock) {
    throw new ActionNotCurrentlyAllowedError()
  }

  if (state.pendingBlock.pendingPlayers.size > 1) {
    state.pendingBlock.pendingPlayers.delete(playerName)
    return { updateLastEventTimestamp: false }
  }

  const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer)
  const blockPlayer = state.players.find(({ name }) => name === state.pendingBlock?.sourcePlayer)

  if (!actionPlayer || !blockPlayer) {
    throw new UnableToFindPlayerError()
  }

  const claimedInfluence = getInfluenceRequiredForAction(state.pendingAction.action, state.settings)
  if (claimedInfluence) {
    addClaimedInfluence(actionPlayer, claimedInfluence)
  }
  addClaimedInfluence(blockPlayer, state.pendingBlock?.claimedInfluence)

  // Block succeeded unchallenged — if the blocker was bluffing, it succeeded
  if (state.pendingBlock?.claimedInfluence && !blockPlayer.influences.includes(state.pendingBlock.claimedInfluence)) {
    recordSuccessfulBluff(state, blockPlayer.name)
  }

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
}

export const blockResponseHandler = async ({ roomId, playerId, response, isForcedMove }: {
  roomId: string
  playerId: string
  response: Responses
  isForcedMove?: boolean
}) => {
  const gameState = await getGameState(roomId)

  enforceSpeedRoundTimer(gameState, isForcedMove)

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

  let latestState: GameState
  if (response === Responses.Challenge) {
    latestState = await mutateGameState(gameState, (state) => {
      if (isForcedMove) logForcedMove(state, player)

      const blockPlayer = state.players.find(({ name }) => name === state.pendingBlock?.sourcePlayer)

      if (!blockPlayer) {
        throw new UnableToFindPlayerError()
      }

      recordChallengeMade(state, player.name)
      logEvent(state, {
        event: EventMessages.ChallengePending,
        primaryPlayer: player.name,
        secondaryPlayer: blockPlayer.name
      })
      state.pendingBlockChallenge = { sourcePlayer: player.name }
    })
  } else if (response === Responses.Pass) {
    latestState = await mutateGameState(gameState, (state) => {
      if (isForcedMove) logForcedMove(state, player)

      return processPassBlockResponse(state, player.name)
    })
  }

  return { roomId, playerId, gameState: latestState! }
}

export const blockChallengeResponseHandler = async ({ roomId, playerId, influence, isForcedMove }: {
  roomId: string
  playerId: string
  influence: Influences
  isForcedMove?: boolean
}) => {
  const gameState = await getGameState(roomId)

  enforceSpeedRoundTimer(gameState, isForcedMove)

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

  let latestState: GameState
  if (influence === gameState.pendingBlock!.claimedInfluence) {
    latestState = await mutateGameState(gameState, (state) => {
      if (isForcedMove) logForcedMove(state, player)

      if (!state.pendingAction || !state.pendingBlock) {
        throw new ActionNotCurrentlyAllowedError()
      }

      const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer)
      const challengePlayer = state.players.find(({ name }) => name === state.pendingBlockChallenge?.sourcePlayer)

      if (!actionPlayer || !challengePlayer) {
        throw new UnableToFindPlayerError()
      }

      const claimedInfluence = getInfluenceRequiredForAction(state.pendingAction.action, state.settings)
      if (claimedInfluence) {
        addClaimedInfluence(actionPlayer, claimedInfluence)
      }

      revealAndReplaceInfluence(state, state.pendingBlock.sourcePlayer, influence)
      logEvent(state, {
        event: EventMessages.BlockSuccessful,
        primaryPlayer: state.pendingBlock.sourcePlayer,
        secondaryPlayer: state.turnPlayer!
      })
      // Block challenge failed — blocker was telling the truth
      recordInfluenceKill(state, state.pendingBlock.sourcePlayer, challengePlayer.name)
      recordTimelineBlockChallenge(state, challengePlayer.name, false)
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
    latestState = await mutateGameState(gameState, (state) => {
      if (isForcedMove) logForcedMove(state, player)

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
      // Block challenge succeeded — blocker was bluffing
      recordSuccessfulChallenge(state, challengePlayer.name)
      recordInfluenceKill(state, challengePlayer.name, blockPlayer.name)
      recordTimelineBlockChallenge(state, challengePlayer.name, true)
      const claimedInfluence = getInfluenceRequiredForAction(state.pendingAction!.action, state.settings)
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

  return { roomId, playerId, gameState: latestState }
}

export const loseInfluencesHandler = async ({ roomId, playerId, influences, isForcedMove }: {
  roomId: string
  playerId: string
  influences: Influences[]
  isForcedMove?: boolean
}) => {
  const gameState = await getGameState(roomId)

  enforceSpeedRoundTimer(gameState, isForcedMove)

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

  const updatedState = await mutateGameState(gameState, (state) => {
    if (isForcedMove) logForcedMove(state, player)

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
          losingPlayer.influences.indexOf(influence),
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

  return { roomId, playerId, gameState: updatedState }
}

export const sendChatMessageHandler = async ({ roomId, playerId, messageId, messageText }: {
  roomId: string
  playerId: string
  messageId: string
  messageText: string
}) => {
  const gameState = await getGameState(roomId)

  const player = getPlayerInRoom({ gameState, playerId })

  const updatedState = await mutateGameState(gameState, (state) => {
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

  return { roomId, playerId, gameState: updatedState }
}

export const setChatMessageDeletedHandler = async ({ roomId, playerId, messageId, deleted }: {
  roomId: string
  playerId: string
  messageId: string
  deleted: boolean
}) => {
  const gameState = await getGameState(roomId)

  const player = getPlayerInRoom({ gameState, playerId })

  const updatedState = await mutateGameState(gameState, (state) => {
    const existingMessage = state.chatMessages.find(({ id }) => id === messageId)

    if (!existingMessage) {
      throw new MessageDoesNotExistError()
    }

    if (existingMessage.from !== player.name) {
      throw new MessageIsNotYoursError()
    }

    existingMessage.deleted = deleted
  })

  return { roomId, playerId, gameState: updatedState }
}

export const setEmojiOnChatMessageHandler = async ({
  roomId,
  playerId,
  messageId,
  emoji,
  selected,
}: {
  roomId: string
  playerId: string
  messageId: string
  emoji: string
  selected: boolean
  language: AvailableLanguageCode
}) => {
  const gameState = await getGameState(roomId)

  const player = getPlayerInRoom({ gameState, playerId })

  const updatedState = await mutateGameState(gameState, (state) => {
    const existingMessage = state.chatMessages.find(
      ({ id }) => id === messageId
    )

    if (!existingMessage) {
      throw new MessageDoesNotExistError()
    }

    if (selected) {
      existingMessage.emojis ??= {}
      if (!existingMessage.emojis[emoji]) {
        existingMessage.emojis[emoji] = new Set()
      }
      existingMessage.emojis[emoji].add(player.name)
    } else if (existingMessage.emojis?.[emoji]) {
      existingMessage.emojis[emoji].delete(player.name)
      if (!existingMessage.emojis[emoji].size) {
        delete existingMessage.emojis[emoji]
      }
    }
  })

  return { roomId, playerId, gameState: updatedState }
}

export const revealForExamineHandler = async ({ roomId, playerId, influence }: {
  roomId: string
  playerId: string
  influence: Influences
}) => {
  const gameState = await getGameState(roomId)
  const player = getPlayerInRoom({ gameState, playerId })

  if (!gameState.pendingExamine || gameState.pendingExamine.targetPlayer !== player.name) {
    throw new ActionNotCurrentlyAllowedError()
  }

  if (!player.influences.includes(influence)) {
    throw new MissingInfluenceError()
  }

  const updatedState = await mutateGameState(gameState, (state) => {
    state.pendingExamine!.revealedInfluence = influence
  })

  return { roomId, playerId, gameState: updatedState }
}

export const examineDecisionHandler = async ({ roomId, playerId, forceSwap }: {
  roomId: string
  playerId: string
  forceSwap: boolean
}) => {
  const gameState = await getGameState(roomId)
  const player = getPlayerInRoom({ gameState, playerId })

  if (!gameState.pendingExamine || gameState.pendingExamine.examiner !== player.name || !gameState.pendingExamine.revealedInfluence) {
    throw new ActionNotCurrentlyAllowedError()
  }

  const updatedState = await mutateGameState(gameState, (state) => {
    const targetPlayer = state.players.find((p) => p.name === state.pendingExamine!.targetPlayer)

    if (!targetPlayer) {
      throw new UnableToFindPlayerError()
    }

    logEvent(state, {
      event: forceSwap ? EventMessages.ExamineSwapped : EventMessages.ExamineKept,
      primaryPlayer: player.name,
      secondaryPlayer: targetPlayer.name
    })

    if (forceSwap) {
      const influenceIndex = targetPlayer.influences.indexOf(state.pendingExamine!.revealedInfluence!)
      if (influenceIndex !== -1) {
        targetPlayer.influences.splice(influenceIndex, 1)
        state.deck.push(state.pendingExamine!.revealedInfluence!)
        shuffleDeck(state)
        targetPlayer.influences.push(drawCardFromDeck(state))
      }
    }

    delete state.pendingExamine
    moveTurnToNextPlayer(state)
  })

  return { roomId, playerId, gameState: updatedState }
}
