import { rehydrateGameState, isSameState, dehydrateGameState } from '../../../shared/helpers/state'
import { EventMessage, GameState, DehydratedGameState, Influences, Player, PublicGameState, PublicPlayer } from '../../../shared/types/game'
import { shuffle } from './array'
import { DeckIsEmptyError, EveryonePassedWithPendingDecisionError, IncorrectTotalCardCountError, InvalidPlayerCountError, InvalidTurnPlayerError, PlayersMustHave2InfluencesError, RoomNotFoundError, StateChangedSinceValidationError } from './errors'
import { getValue, setValue } from './storage'
import { compressString, decompressString } from './compression'
import { getCurrentTimestamp } from './time'
import { MAX_PLAYER_COUNT } from '../../../shared/helpers/playerCount'
import { getCountOfEachInfluence } from './deck'

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
  const oneMonth = 2678400
  validateGameState(newState)
  const compressed = compressString(JSON.stringify(newState))
  await setValue(roomId.toUpperCase(), compressed, oneMonth)
}

export const createGameState = async (roomId: string, gameState: GameState) => {
  await setGameState(roomId, dehydrateGameState(gameState))
}

export const mutateGameState = async (
  validatedState: GameState,
  mutation: (state: GameState) => void
) => {
  const gameState = await getGameState(validatedState.roomId)

  const dehydratedValidatedGameState = dehydrateGameState(validatedState)

  if (!isSameState(dehydrateGameState(gameState), dehydratedValidatedGameState)) {
    throw new StateChangedSinceValidationError()
  }

  mutation(gameState)

  const dehydratedGameState = dehydrateGameState(gameState)

  if (isSameState(dehydratedGameState, dehydratedValidatedGameState)) {
    return
  }

  dehydratedGameState.lastEventTimestamp = getCurrentTimestamp().toISOString()

  await setGameState(validatedState.roomId, dehydratedGameState)
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
