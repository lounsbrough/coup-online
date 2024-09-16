import { shuffle } from "../utilities/array"
import { ActionAttributes, Actions, GameState, Influences } from "../../../shared/types/game"
import { createGameState, drawCardFromDeck, getGameState, logEvent, mutateGameState } from "../utilities/gameState"


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

const getNewGameState = (roomId: string): GameState => ({
  roomId,
  players: [],
  deck: shuffle(buildGameDeck()),
  deadCards: [],
  pendingInfluenceLoss: {},
  isStarted: false,
  eventLogs: []
})

export const addPlayerToGame = async (state: GameState, playerId: string, playerName: string) => {
  state.players.push({
    id: playerId,
    name: playerName,
    coins: 2,
    influences: Array.from({ length: 2 }, () => drawCardFromDeck(state)),
    color: ['#13B363', '#0068FF', '#FD6C33', '#CC55CC', '#FFC303', '#FA0088'][state.players.length]
  })
}

export const createNewGame = async (roomId: string, playerId: string, playerName: string) => {
  const newGameState = getNewGameState(roomId)
  addPlayerToGame(newGameState, playerId, playerName)
  await createGameState(roomId, newGameState)
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
  const newGameState = getNewGameState(roomId)
  newGameState.players = shuffle(oldGameState.players.map((player) => ({
    ...player,
    coins: 2,
    influences: Array.from({ length: 2 }, () => drawCardFromDeck(newGameState))
  })))
  await createGameState(roomId, newGameState)
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
