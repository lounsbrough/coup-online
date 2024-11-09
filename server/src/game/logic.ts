import { shuffle } from "../utilities/array"
import { ActionAttributes, Actions, AiPersonality, GameState, Influences, Player, Responses } from "../../../shared/types/game"
import { createGameState, drawCardFromDeck, getGameState, logEvent, mutateGameState, shuffleDeck } from "../utilities/gameState"
import { getActionMessage } from "../../../shared/utilities/message"
import { GameMutationInputError } from "../utilities/errors"

export const killPlayerInfluence = (state: GameState, playerName: string, influence: Influences) => {
  const player = state.players.find(({ name }) => name === playerName)

  if (!player) {
    throw new GameMutationInputError('Player not found')
  }

  removeClaimedInfluence(player, influence)
  player.influences.splice(
    player.influences.findIndex((i) => i === influence),
    1
  )
  player.deadInfluences.push(influence)
  logEvent(state, `${player.name} lost their ${influence}`)

  if (!player.influences.length) {
    logEvent(state, `${player.name} is out!`)
    delete state.pendingInfluenceLoss[player.name]
  }

  if (!Object.keys(state.pendingInfluenceLoss).length && !state.pendingAction) {
    moveTurnToNextPlayer(state)
  }
}

export const promptPlayerToLoseInfluence = (
  state: GameState,
  playerName: string,
  putBackInDeck: boolean = false
) => {
  const player = state.players.find(({ name }) => name === playerName)

  if (!player) {
    throw new GameMutationInputError('Player not found')
  }

  const pendingInfluencesToKill = state.pendingInfluenceLoss[playerName]
    ?.filter(({ putBackInDeck }) => !putBackInDeck).length ?? 0

  if (player.influences.length - pendingInfluencesToKill <= 1) {
    player.influences.forEach((influence) => {
      killPlayerInfluence(state, playerName, influence)
    })
    delete state.pendingInfluenceLoss[playerName]
    return
  }

  state.pendingInfluenceLoss[playerName] = [
    ...(state.pendingInfluenceLoss[playerName] ?? []),
    { putBackInDeck }
  ]
}

export const processPendingAction = (state: GameState) => {
  if (!state.pendingAction) {
    throw new GameMutationInputError('Pending Action not found')
  }

  const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer)
  const targetPlayer = state.players.find(({ name }) => name === state.pendingAction!.targetPlayer)

  if (!actionPlayer) {
    throw new GameMutationInputError('Action Player not found')
  }

  logEvent(state, getActionMessage({
    action: state.pendingAction!.action,
    tense: 'complete',
    actionPlayer: actionPlayer!.name,
    targetPlayer: targetPlayer?.name
  }))

  if (state.pendingAction.action === Actions.Assassinate) {
    if (!targetPlayer) {
      throw new GameMutationInputError('Target Player not found')
    }

    addClaimedInfluence(actionPlayer, Influences.Assassin)
    actionPlayer.coins -= ActionAttributes.Assassinate.coinsRequired!
    holdGrudge({ state, offended: targetPlayer.name, offender: actionPlayer.name, weight: grudgeSizes[Actions.Assassinate] })
    promptPlayerToLoseInfluence(state, targetPlayer.name)
  } else if (state.pendingAction.action === Actions.Exchange) {
    removeClaimedInfluence(actionPlayer)
    actionPlayer.influences.push(drawCardFromDeck(state), drawCardFromDeck(state))
    state.deck = shuffle(state.deck)
    promptPlayerToLoseInfluence(state, actionPlayer.name, true)
    promptPlayerToLoseInfluence(state, actionPlayer.name, true)
  } else if (state.pendingAction.action === Actions.ForeignAid) {
    actionPlayer.coins += 2
  } else if (state.pendingAction.action === Actions.Steal) {
    if (!targetPlayer) {
      throw new GameMutationInputError('Target Player not found')
    }

    addClaimedInfluence(actionPlayer, Influences.Captain)
    holdGrudge({ state, offended: targetPlayer.name, offender: actionPlayer.name, weight: grudgeSizes[Actions.Steal] })
    const coinsAvailable = Math.min(2, targetPlayer.coins)
    actionPlayer.coins += coinsAvailable
    targetPlayer.coins -= coinsAvailable
  } else if (state.pendingAction.action === Actions.Tax) {
    addClaimedInfluence(actionPlayer, Influences.Duke)
    actionPlayer.coins += 3
  }

  if (!Object.keys(state.pendingInfluenceLoss).length) {
    moveTurnToNextPlayer(state)
  }

  delete state.pendingAction
}

const buildGameDeck = () => {
  return Object.values(Influences)
    .flatMap((influence) => Array.from({ length: 3 }, () => influence))
}

const getNewGameState = (roomId: string): GameState => ({
  roomId,
  availablePlayerColors: ['#13CC63', '#3399dd', '#FD6C33', '#00CCDD', '#FFC303', '#FA0088'],
  players: [],
  deck: shuffle(buildGameDeck()),
  pendingInfluenceLoss: {},
  isStarted: false,
  eventLogs: [],
  lastEventTimestamp: new Date()
})

export const addPlayerToGame = ({
  state,
  playerId,
  playerName,
  ai = false,
  aiPersonality,
}: {
  state: GameState
  playerId: string
  playerName: string
  ai?: boolean
  aiPersonality?: AiPersonality
}) => {
  state.players.push({
    id: playerId,
    name: playerName,
    coins: 2,
    influences: Array.from({ length: 2 }, () => drawCardFromDeck(state)),
    deadInfluences: [],
    claimedInfluences: [],
    color: state.availablePlayerColors.shift()!,
    ai,
    grudges: {},
    ...(aiPersonality && { personality: aiPersonality })
  })
}

export const removePlayerFromGame = (state: GameState, playerName: string) => {
  const player = state.players.splice(
    state.players.findIndex(({ name }) => name === playerName),
    1
  )[0]
  state.availablePlayerColors.push(player.color)
  state.deck.push(...player.influences, ...player.deadInfluences)
}

export const createNewGame = async (roomId: string, playerId: string, playerName: string) => {
  const newGameState = getNewGameState(roomId)
  addPlayerToGame({ state: newGameState, playerId, playerName })
  await createGameState(roomId, newGameState)
}

export const startGame = async (gameState: GameState) => {
  await mutateGameState(gameState, (state) => {
    state.isStarted = true
    state.players = shuffle(state.players)
    state.turnPlayer = state.players[0].name
    logEvent(state, 'Game has started')
  })
}

export const humanOpponentsRemain = (gameState: GameState, player: Player) =>
  gameState.players.some(({ ai, name, influences }) => !ai && name !== player.name && influences.length)

export const resetGame = async (roomId: string) => {
  const oldGameState = await getGameState(roomId)
  const newGameState = getNewGameState(roomId)
  newGameState.players = oldGameState.players.map((player) => ({
    ...player,
    coins: 2,
    influences: Array.from({ length: 2 }, () => drawCardFromDeck(newGameState)),
    deadInfluences: []
  }))
  newGameState.availablePlayerColors = oldGameState.availablePlayerColors
  await createGameState(roomId, newGameState)
}

export const revealAndReplaceInfluence = (state: GameState, playerName: string, influence: Influences) => {
  const player = state.players.find(({ name }) => name === playerName)

  if (!player) {
    throw new GameMutationInputError('Player not found')
  }

  removeClaimedInfluence(player, influence)
  state.deck.push(player.influences.splice(
    player.influences.findIndex((i) => i === influence),
    1
  )[0])
  shuffleDeck(state)
  player.influences.push(drawCardFromDeck(state))
  logEvent(state, `${playerName} revealed and replaced ${influence}`)
}

export const moveTurnToNextPlayer = (state: GameState) => {
  const currentIndex = state.players.findIndex((player) => player.name === state.turnPlayer)

  let nextIndex = currentIndex + 1
  while (!state.players[nextIndex % state.players.length].influences.length) {
    if (nextIndex % state.players.length === currentIndex) {
      throw new GameMutationInputError('Unable to determine next player turn')
    }

    nextIndex++
  }

  state.turnPlayer = state.players[nextIndex % state.players.length].name
}

export const grudgeSizes = {
  [Actions.Coup]: 10,
  [Actions.Assassinate]: 10,
  [Actions.Steal]: 3,
  [Responses.Challenge]: 5
}

export const holdGrudge = ({ state, offended, offender, weight }: {
  state: GameState
  offended: string
  offender: string
  weight: number
}) => {
  const offendedPlayer = state.players.find(({ name }) => name === offended)!
  offendedPlayer.grudges[offender] = (offendedPlayer.grudges[offender] ?? 0) + weight
}

export const addClaimedInfluence = (player: Player, influence: Influences) => {
  if (!player.claimedInfluences.some((i) => i === influence)) {
    player.claimedInfluences.push(influence)
  }
}

export const removeClaimedInfluence = (player: Player, influence?: Influences) => {
  if (!influence) {
    player.claimedInfluences = []
    return
  }

  player.claimedInfluences = player.claimedInfluences.filter((i) => i !== influence)
}
