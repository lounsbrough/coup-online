import { GameState, Influences, Player, PublicGameState, PublicPlayer } from '../../../shared/types/game'
import { shuffle } from './array'
import { GameMutationInputError } from './errors'
import { getValue, setValue } from './storage'
import { compressString, decompressString } from './compression'

export const getGameState = async (
  roomId: string
): Promise<GameState> => {
  const compressed = await getValue(roomId.toUpperCase())

  if (!compressed) {
    throw new GameMutationInputError(`Room ${roomId} does not exist`, 404)
  }

  return JSON.parse(decompressString(compressed))
}

export const getPublicGameState = async ({ roomId, gameState, playerId }: {
  roomId?: string
  gameState?: GameState
  playerId: string
}): Promise<PublicGameState> => {
  if ([roomId, gameState].filter(Boolean).length !== 1) {
    throw new GameMutationInputError('Please provide roomId or gameState')
  }

  const fullGameState = gameState || await getGameState(roomId!)

  let selfPlayer: Player | undefined
  const publicPlayers: PublicPlayer[] = []
  fullGameState.players.forEach((player) => {
    const pendingInfluenceCountToPutBack = fullGameState.pendingInfluenceLoss[player.name]
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
    eventLogs: fullGameState.eventLogs,
    isStarted: fullGameState.isStarted,
    pendingInfluenceLoss: fullGameState.pendingInfluenceLoss,
    players: publicPlayers,
    roomId: fullGameState.roomId,
    ...(selfPlayer && { selfPlayer }),
    ...(fullGameState.pendingAction && { pendingAction: fullGameState.pendingAction }),
    ...(fullGameState.pendingActionChallenge && { pendingActionChallenge: fullGameState.pendingActionChallenge }),
    ...(fullGameState.pendingBlock && { pendingBlock: fullGameState.pendingBlock }),
    ...(fullGameState.pendingBlockChallenge && { pendingBlockChallenge: fullGameState.pendingBlockChallenge }),
    ...(fullGameState.turnPlayer && { turnPlayer: fullGameState.turnPlayer })
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
  if (Object.values(cardCounts).some((count) => count !== 3)) {
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
