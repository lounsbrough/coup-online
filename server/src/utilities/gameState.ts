import { GameState, Influences, Player, PublicGameState, PublicPlayer } from '../../../shared/types/game'
import { shuffle } from './array'
import { getValue, setValue } from './storage'

export const getGameState = async (
  roomId: string
): Promise<GameState | null> => {
  const state = JSON.parse(await getValue(roomId))
  return state ? { ...state } : null
}

export const getPublicGameState = async ({ roomId, gameState, playerId }: {
  roomId?: string
  gameState?: GameState
  playerId: string
}): Promise<PublicGameState | null> => {
  if ([roomId, gameState].filter(Boolean).length !== 1) {
    throw new Error('Please provide roomId or gameState')
  }

  const fullGameState = gameState ?? await getGameState(roomId)

  if (fullGameState === null) {
    return null
  }

  let selfPlayer: Player
  const publicPlayers: PublicPlayer[] = []
  fullGameState.players.forEach((player) => {
    const pendingInfluenceCountToPutBack = fullGameState.pendingInfluenceLoss[player.name]
      ?.filter(({ putBackInDeck }) => putBackInDeck)?.length ?? 0
    publicPlayers.push({
      name: player.name,
      coins: player.coins,
      influenceCount: player.influences.length - pendingInfluenceCountToPutBack,
      color: player.color
    })
    if (player.id === playerId) {
      selfPlayer = player
    }
  })

  return {
    deadCards: fullGameState.deadCards,
    eventLogs: fullGameState.eventLogs,
    isStarted: fullGameState.isStarted,
    pendingAction: fullGameState.pendingAction,
    pendingActionChallenge: fullGameState.pendingActionChallenge,
    pendingBlock: fullGameState.pendingBlock,
    pendingBlockChallenge: fullGameState.pendingBlockChallenge,
    pendingInfluenceLoss: fullGameState.pendingInfluenceLoss,
    players: publicPlayers,
    roomId: fullGameState.roomId,
    selfPlayer,
    turnPlayer: fullGameState.turnPlayer
  }
}

export const validateGameState = (state: GameState) => {
  if (state.players.length < 1 || state.players.length > 6) {
    throw new Error("Game state must always have 1 to 6 players")
  }
  if (state.isStarted && !state.players.find((player) => player.name === state.turnPlayer)?.influences.length) {
    throw new Error("Invalid turn player")
  }
  if (state.players.some((player) =>
    player.influences.length - (state.pendingInfluenceLoss[player.name]?.length ?? 0) > 2)
  ) {
    throw new Error("Players must have at most 2 influences")
  }
  const cardCounts = Object.fromEntries(Object.values(Influences).map((influence) => [influence, 0]))
  state.deck.forEach((card) => cardCounts[card]++)
  state.deadCards.forEach((card) => cardCounts[card]++)
  state.players.flatMap(({ influences }) => influences).forEach((card) => cardCounts[card]++)
  if (Object.values(cardCounts).some((count) => count !== 3)) {
    throw new Error("Incorrect total card count in game")
  }
  if (state.pendingAction?.pendingPlayers?.length === 0
    && !state.pendingActionChallenge
    && !state.pendingBlock) {
    throw new Error('Everyone has passed but the action is still pending')
  }
  if (state.pendingBlock?.pendingPlayers?.length === 0
    && !state.pendingBlockChallenge) {
    throw new Error('Everyone has passed but the block is still pending')
  }
}

const setGameState = async (roomId: string, newState: GameState) => {
  const oneDay = 86400
  validateGameState(newState)
  await setValue(roomId, JSON.stringify(newState), oneDay)
}

export const createGameState = async (roomId: string, gameState: GameState) => {
  await setGameState(roomId, gameState)
}

export const mutateGameState = async (
  roomId: string,
  mutation: (state: GameState) => void
) => {
  const gameState = await getGameState(roomId)
  mutation(gameState)
  await setGameState(roomId, gameState)
}

export const shuffleDeck = (state: GameState) => {
  state.deck = shuffle(state.deck)
}

export const drawCardFromDeck = (state: GameState) => {
  return state.deck.pop()
}

export const logEvent = (state: GameState, log: string) => {
  state.eventLogs.push(log)
  if (state.eventLogs.length > 100) {
    state.eventLogs.splice(0, 1)
  }
}
