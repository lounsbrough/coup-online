import { ActionAttributes, Actions, GameState, Influences, Player, PublicGameState, PublicPlayer } from '../../shared/types/game'
import { shuffle } from './array'
import { getValue, setValue } from './storage'

export const getGameState = async (
  roomId: string
): Promise<GameState | null> => {
  const state = JSON.parse(await getValue(roomId))
  return state ? { ...state } : null
}

export const getPublicGameState = async (
  roomId: string,
  playerId: string
): Promise<PublicGameState | null> => {
  const gameState = await getGameState(roomId)

  if (gameState === null) {
    return null
  }

  let selfPlayer: Player
  const publicPlayers: PublicPlayer[] = []
  gameState.players.forEach((player) => {
    publicPlayers.push({
      name: player.name,
      coins: player.coins,
      influenceCount: player.influences.length,
      color: player.color
    })
    if (player.id === playerId) {
      selfPlayer = player
    }
  })

  return {
    deadCards: gameState.deadCards,
    eventLogs: gameState.eventLogs,
    isStarted: gameState.isStarted,
    pendingAction: gameState.pendingAction,
    pendingActionChallenge: gameState.pendingActionChallenge,
    pendingBlock: gameState.pendingBlock,
    pendingBlockChallenge: gameState.pendingBlockChallenge,
    pendingInfluenceLoss: gameState.pendingInfluenceLoss,
    players: publicPlayers,
    roomId: gameState.roomId,
    selfPlayer,
    turnPlayer: gameState.turnPlayer
  }
}

const setGameState = async (roomId: string, newState: GameState) => {
  const fifteenMinutes = 900
  await setValue(roomId, JSON.stringify(newState), fifteenMinutes)
}

export const validateGameState = (state: GameState) => {
  if (state.players.length < 1 || state.players.length > 6) {
    throw new Error("Game state must always have 1 to 6 players")
  }
  if (!state.players.find((player) => player.name === state.turnPlayer)?.influences.length) {
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
}

export const mutateGameState = async (
  roomId: string,
  mutation: (state: GameState) => void
) => {
  const gameState = await getGameState(roomId)
  mutation(gameState)
  validateGameState(gameState)
  await setGameState(roomId, gameState)
}

export const promptPlayerToLoseInfluence = (
  state: GameState,
  playerName: string,
  putBackInDeck: boolean = false
) => {
  if (state.players.find(({ name }) => name === playerName).influences.length <= (state.pendingInfluenceLoss[playerName]?.length ?? 0)) {
    return
  }

  state.pendingInfluenceLoss[playerName] = [
    ...(state.pendingInfluenceLoss[playerName] ?? []),
    { putBackInDeck }
  ]
}

export const processPendingAction = async (state: GameState) => {
  const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer)
  const targetPlayer = state.players.find(({ name }) => name === state.pendingAction.targetPlayer)
  if (state.pendingAction.action === Actions.Assassinate) {
    actionPlayer.coins -= ActionAttributes.Assassinate.coinsRequired
    promptPlayerToLoseInfluence(state, targetPlayer.name)
  } else if (state.pendingAction.action === Actions.Exchange) {
    actionPlayer.influences.push(drawCardFromDeck(state), drawCardFromDeck(state))
    state.deck = shuffle(state.deck)
    promptPlayerToLoseInfluence(state, actionPlayer.name, true)
    promptPlayerToLoseInfluence(state, actionPlayer.name, true)
  } else if (state.pendingAction.action === Actions.ForeignAid) {
    actionPlayer.coins += 2
  } else if (state.pendingAction.action === Actions.Steal) {
    const coinsAvailable = Math.min(2, targetPlayer.coins)
    actionPlayer.coins += coinsAvailable
    targetPlayer.coins -= coinsAvailable
  } else if (state.pendingAction.action === Actions.Tax) {
    actionPlayer.coins += 3
  }

  if (!Object.keys(state.pendingInfluenceLoss).length) {
    moveTurnToNextPlayer(state)
  }

  logEvent(state, `${actionPlayer.name} used ${state.pendingAction.action}${targetPlayer ? ` on ${targetPlayer.name}` : ''}`)
  delete state.pendingAction
}

const buildGameDeck = () => {
  return Object.values(Influences)
    .flatMap((influence) => Array.from({ length: 3 }, () => influence))
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

export const createNewGame = async (roomId: string) => {
  await setGameState(roomId, {
    roomId,
    players: [],
    deck: shuffle(buildGameDeck()),
    deadCards: [],
    pendingInfluenceLoss: {},
    isStarted: false,
    eventLogs: []
  })
}

export const startGame = async (roomId: string) => {
  await mutateGameState(roomId, (state) => {
    state.isStarted = true
    state.players = shuffle(state.players)
    state.turnPlayer = state.players[0].name
    logEvent(state, 'Game has started')
  })
}

export const resetGame = async (roomId: string) => {
  const oldGameState = await getGameState(roomId)
  await createNewGame(roomId)
  await mutateGameState(roomId, (state) => {
    const newPlayers = shuffle(oldGameState.players.map((player) => ({
      ...player,
      coins: 2,
      influences: Array.from({ length: 2 }, () => drawCardFromDeck(state))
    })))
    state.players = newPlayers
  })
}

export const addPlayerToGame = async (roomId: string, playerId: string, playerName: string) => {
  await mutateGameState(roomId, (state) => {
    state.players.push({
      id: playerId,
      name: playerName,
      coins: 2,
      influences: Array.from({ length: 2 }, () => drawCardFromDeck(state)),
      color: ['#23C373', '#0078ff', '#fD6C33', '#ff7799', '#FFC303', '#fA0088'][state.players.length]
    })
    return state
  })
}

export const killPlayerInfluence = async (state: GameState, playerName: string, influence: Influences) => {
  const player = state.players.find(({ name }) => name === playerName)
  player.influences.splice(
    player.influences.findIndex((i) => i === influence),
    1
  )
  logEvent(state, `${player.name} lost their ${influence}`)
  state.deadCards.push(influence)
}

export const moveTurnToNextPlayer = (state: GameState) => {
  const currentIndex = state.players.findIndex((player) => player.name === state.turnPlayer)

  let nextIndex = currentIndex + 1
  while (!state.players[nextIndex % state.players.length].influences.length) {
    if (nextIndex % state.players.length === currentIndex) {
      throw new Error('Unable to determine next player turn')
    }

    nextIndex++
  }

  state.turnPlayer = state.players[nextIndex % state.players.length].name
}
