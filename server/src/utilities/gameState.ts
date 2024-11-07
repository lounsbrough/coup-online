import { GameState, Influences, Player, PublicGameState, PublicPlayer } from '../../../shared/types/game'
import { shuffle } from './array'
import { GameMutationInputError } from './errors'
import { getValue, setValue } from './storage'
import { compressString, decompressString } from './compression'
import { getCurrentTimestamp } from './time'

export const countOfEachInfluenceInDeck = 3

export const getGameState = async (
  roomId: string
): Promise<GameState> => {
  const compressed = await getValue(roomId.toUpperCase())

  if (!compressed) {
    throw new GameMutationInputError(`Room ${roomId} does not exist`, 404)
  }

  const state = JSON.parse(decompressString(compressed))

  state.lastEventTimestamp = new Date(state.lastEventTimestamp ?? null)

  return state
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
      color: player.color,
      ai: player.ai
    })
    if (player.id === playerId) {
      selfPlayer = player
    }
  })

  return {
    eventLogs: gameState.eventLogs,
    lastEventTimestamp: gameState.lastEventTimestamp,
    isStarted: gameState.isStarted,
    pendingInfluenceLoss: gameState.pendingInfluenceLoss,
    players: publicPlayers,
    roomId: gameState.roomId,
    deckCount: gameState.deck.length,
    ...(selfPlayer && { selfPlayer }),
    ...(gameState.pendingAction && { pendingAction: gameState.pendingAction }),
    ...(gameState.pendingActionChallenge && { pendingActionChallenge: gameState.pendingActionChallenge }),
    ...(gameState.pendingBlock && { pendingBlock: gameState.pendingBlock }),
    ...(gameState.pendingBlockChallenge && { pendingBlockChallenge: gameState.pendingBlockChallenge }),
    ...(gameState.turnPlayer && { turnPlayer: gameState.turnPlayer }),
    ...(gameState.resetGameRequest && { resetGameRequest: gameState.resetGameRequest })
  }
}

export const validateGameState = (state: GameState) => {
  if (state.players.length < 1 || state.players.length > 6) {
    throw new GameMutationInputError("Game state must always have 1 to 6 players")
  }
  if (state.isStarted && !state.players.find((player) => player.name === state.turnPlayer)?.influences.length) {
    throw new GameMutationInputError("Invalid turn player")
  }
  if (state.players.some((player) =>
    (player.influences.length + player.deadInfluences.length) -
    (state.pendingInfluenceLoss[player.name]?.filter(({ putBackInDeck }) => putBackInDeck)?.length ?? 0)
    !== 2)
  ) {
    throw new GameMutationInputError("Players must have exactly 2 influences")
  }
  const cardCounts = Object.fromEntries(Object.values(Influences).map((influence) => [influence, 0]))
  state.deck.forEach((card) => cardCounts[card]++)
  state.players.forEach(({ influences, deadInfluences }) => {
    influences.forEach((card) => cardCounts[card]++)
    deadInfluences.forEach((card) => cardCounts[card]++)
  })
  if (Object.values(cardCounts).some((count) => count !== countOfEachInfluenceInDeck)) {
    throw new GameMutationInputError("Incorrect total card count in game")
  }
  if (state.pendingAction?.pendingPlayers?.length === 0
    && !state.pendingActionChallenge
    && !state.pendingBlock) {
    throw new GameMutationInputError('Everyone has passed but the action is still pending')
  }
  if (state.pendingBlock?.pendingPlayers?.length === 0
    && !state.pendingBlockChallenge) {
    throw new GameMutationInputError('Everyone has passed but the block is still pending')
  }
}

const setGameState = async (roomId: string, newState: GameState) => {
  const oneDay = 86400
  validateGameState(newState)
  const compressed = compressString(JSON.stringify(newState))
  await setValue(roomId.toUpperCase(), compressed, oneDay)
}

export const createGameState = async (roomId: string, gameState: GameState) => {
  await setGameState(roomId, gameState)
}

export const mutateGameState = async (
  validatedState: GameState,
  mutation: (state: GameState) => void
) => {
  const gameState = await getGameState(validatedState.roomId)

  if (JSON.stringify(gameState) !== JSON.stringify(validatedState)) {
    throw new GameMutationInputError('State has changed since validation, rejecting mutation')
  }

  mutation(gameState)

  if (JSON.stringify(gameState) === JSON.stringify(validatedState)) {
    return
  }

  gameState.lastEventTimestamp = getCurrentTimestamp()

  await setGameState(validatedState.roomId, gameState)
}

export const shuffleDeck = (state: GameState) => {
  state.deck = shuffle(state.deck)
}

export const drawCardFromDeck = (state: GameState): Influences => {
  if (!state.deck.length) {
    throw new GameMutationInputError('Deck is empty')
  }

  return state.deck.pop()!
}

export const logEvent = (state: GameState, log: string) => {
  state.eventLogs.push(log)
  if (state.eventLogs.length > 100) {
    state.eventLogs.splice(0, 1)
  }
}
