import { rehydrateGameState, isSameState, dehydrateGameState } from '../../../shared/helpers/state'
import { EventMessage, GameState, DehydratedGameState, Influences, Player, PublicGameState, PublicPlayer, EventMessages } from '../../../shared/types/game'
import { shuffle } from './array'
import { DeckIsEmptyError, EveryonePassedWithPendingDecisionError, IncorrectTotalCardCountError, InvalidPlayerCountError, InvalidTurnPlayerError, PlayersMustHave2InfluencesError, RoomNotFoundError, StateChangedSinceValidationError } from './errors'
import { getValue, setValue } from './storage'
import { compressString, decompressString } from './compression'
import { getCurrentTimestamp } from './time'
import { MAX_PLAYER_COUNT } from '../../../shared/helpers/playerCount'
import { GAME_STATE_TTL_SECONDS } from '../../../shared/helpers/constants'
import { getCountOfEachInfluence } from './deck'
import { recordGameStats } from './stats'

export const getGameState = async (
  roomId: string
): Promise<GameState> => {
  const compressed = await getValue(roomId.toUpperCase())

  if (!compressed) {
    throw new RoomNotFoundError()
  }

  const state: DehydratedGameState = JSON.parse(decompressString(compressed))

  return rehydrateGameState(state)
}

export const getPublicGameState = ({ gameState, playerId }: {
  gameState: GameState
  playerId: string
}): PublicGameState => {
  let selfPlayer: Player | undefined
  const publicPlayers: PublicPlayer[] = []
  gameState.players.forEach((player) => {
    const pendingInfluenceCountToPutBack = gameState.pendingInfluenceLoss[player.name]
      ?.filter(({ putBackInDeck }) => putBackInDeck)?.length ?? 0
    publicPlayers.push({
      name: player.name,
      coins: player.coins,
      influenceCount: player.influences.length - pendingInfluenceCountToPutBack,
      deadInfluences: player.deadInfluences,
      claimedInfluences: player.claimedInfluences,
      unclaimedInfluences: player.unclaimedInfluences,
      color: player.color,
      ai: player.ai,
      grudges: player.grudges,
      ...(player.uid && { uid: player.uid }),
      ...(player.photoURL && { photoURL: player.photoURL }),
      ...(!player.personalityHidden && player.personality && { personality: player.personality })
    })
    if (player.id === playerId) {
      selfPlayer = player
    }
  })

  return {
    eventLogs: gameState.eventLogs,
    chatMessages: gameState.chatMessages.map((chatMessage) => ({
      ...chatMessage,
      text: chatMessage.deleted ? '' : chatMessage.text
    })),
    settings: gameState.settings,
    lastEventTimestamp: gameState.lastEventTimestamp,
    isStarted: gameState.isStarted,
    pendingInfluenceLoss: gameState.pendingInfluenceLoss,
    players: publicPlayers,
    roomId: gameState.roomId,
    deckCount: gameState.deck.length,
    turn: gameState.turn,
    ...(selfPlayer && { selfPlayer }),
    ...(gameState.pendingAction && { pendingAction: gameState.pendingAction }),
    ...(gameState.pendingActionChallenge && { pendingActionChallenge: gameState.pendingActionChallenge }),
    ...(gameState.pendingBlock && { pendingBlock: gameState.pendingBlock }),
    ...(gameState.pendingBlockChallenge && { pendingBlockChallenge: gameState.pendingBlockChallenge }),
    ...(gameState.turnPlayer && { turnPlayer: gameState.turnPlayer }),
    ...(gameState.resetGameRequest && { resetGameRequest: gameState.resetGameRequest })
  }
}

export const validateGameState = (state: DehydratedGameState) => {
  if (state.players.length < 1 || state.players.length > MAX_PLAYER_COUNT) {
    throw new InvalidPlayerCountError(MAX_PLAYER_COUNT)
  }
  if (state.isStarted && !state.players.find((player) => player.name === state.turnPlayer)?.influences.length) {
    throw new InvalidTurnPlayerError()
  }
  if (state.isStarted && state.players.some((player) =>
    (player.influences.length + player.deadInfluences.length) -
    (state.pendingInfluenceLoss[player.name]?.filter(({ putBackInDeck }) => putBackInDeck)?.length ?? 0)
    !== 2)
  ) {
    throw new PlayersMustHave2InfluencesError()
  }
  const cardCounts = Object.fromEntries(Object.values(Influences).map((influence) => [influence, 0]))
  state.deck.forEach((card) => cardCounts[card]++)
  state.players.forEach(({ influences, deadInfluences }) => {
    influences.forEach((card) => cardCounts[card]++)
    deadInfluences.forEach((card) => cardCounts[card]++)
  })

  const countOfEachInfluence = getCountOfEachInfluence(state.players.length)
  if (Object.values(cardCounts).some((count) => count !== countOfEachInfluence)) {
    throw new IncorrectTotalCardCountError()
  }

  if ((
    state.pendingAction?.pendingPlayers?.length === 0
    && !state.pendingActionChallenge
    && !state.pendingBlock
  ) || (
      state.pendingBlock?.pendingPlayers?.length === 0
      && !state.pendingBlockChallenge
    )) {
    throw new EveryonePassedWithPendingDecisionError()
  }
}

const setGameState = async (roomId: string, newState: DehydratedGameState) => {
  validateGameState(newState)
  const compressed = compressString(JSON.stringify(newState))
  await setValue(roomId.toUpperCase(), compressed, GAME_STATE_TTL_SECONDS)
}

export const createGameState = async (roomId: string, gameState: GameState) => {
  await setGameState(roomId, dehydrateGameState(gameState))
}

export type PostMutationOptions = { updateLastEventTimestamp?: boolean }

export const mutateGameState = async (
  validatedState: GameState,
  mutation: (state: GameState) => PostMutationOptions | void
): Promise<GameState> => {
  const gameState = await getGameState(validatedState.roomId)

  const dehydratedValidatedGameState = dehydrateGameState(validatedState)

  if (!isSameState(dehydrateGameState(gameState), dehydratedValidatedGameState)) {
    throw new StateChangedSinceValidationError()
  }

  const { updateLastEventTimestamp = true } = mutation(gameState) ?? {}

  const dehydratedGameState = dehydrateGameState(gameState)

  if (isSameState(dehydratedGameState, dehydratedValidatedGameState)) {
    return gameState
  }

  if (updateLastEventTimestamp) {
    dehydratedGameState.lastEventTimestamp = getCurrentTimestamp().toISOString()
  }

  // Check if game just ended (exactly 1 player alive) and record stats
  if (gameState.isStarted && gameState.gameId) {
    const previousAlivePlayers = validatedState.players.filter(({ influences }) => influences.length > 0)
    const currentAlivePlayers = gameState.players.filter(({ influences }) => influences.length > 0)
    if (currentAlivePlayers.length === 1 && previousAlivePlayers.length > 1) {
      recordGameStats(gameState).catch(() => { })
    }
  }

  await setGameState(validatedState.roomId, dehydratedGameState)

  return rehydrateGameState(dehydratedGameState)
}

export const shuffleDeck = (state: GameState) => {
  state.deck = shuffle(state.deck)
}

export const drawCardFromDeck = (state: GameState): Influences => {
  if (!state.deck.length) {
    throw new DeckIsEmptyError()
  }

  return state.deck.pop()!
}

export const logEvent = (state: GameState, log: Omit<EventMessage, 'turn'>) => {
  state.eventLogs.push({ ...log, turn: state.turn })
  state.eventLogs = state.eventLogs.filter(({ turn }) =>
    state.turn - turn < state.settings.eventLogRetentionTurns
  )
}

export const logForcedMove = (state: GameState, player: Player) => {
  logEvent(state, {
    event: EventMessages.ForcedMoveProcessed,
    primaryPlayer: player.name
  })
}
