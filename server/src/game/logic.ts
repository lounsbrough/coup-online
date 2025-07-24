import { shuffle } from "../utilities/array"
import { ActionAttributes, Actions, AiPersonality, EventMessages, GameSettings, GameState, Influences, Player, Responses } from "../../../shared/types/game"
import { createGameState, drawCardFromDeck, getGameState, logEvent, shuffleDeck } from "../utilities/gameState"
import { createDeckForPlayerCount } from "../utilities/deck"
import { GameMutationInputError } from "../utilities/errors"
import { MAX_PLAYER_COUNT } from "../../../shared/helpers/playerCount"

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
  logEvent(state, {
    event: EventMessages.PlayerLostInfluence,
    primaryPlayer: player.name,
    influence
  })

  if (!player.influences.length) {
    logEvent(state, {
      event: EventMessages.PlayerDied,
      primaryPlayer: player.name
    })
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

  logEvent(state, {
    event: EventMessages.ActionProcessed,
    action: state.pendingAction!.action,
    primaryPlayer: actionPlayer!.name,
    ...(targetPlayer?.name && {secondaryPlayer: targetPlayer?.name})
  })

  if (state.pendingAction.action === Actions.Assassinate) {
    if (!targetPlayer) {
      throw new GameMutationInputError('Target Player not found')
    }

    actionPlayer.coins -= ActionAttributes.Assassinate.coinsRequired!
    holdGrudge({ state, offended: targetPlayer.name, offender: actionPlayer.name, weight: grudgeSizes[Actions.Assassinate] })
    promptPlayerToLoseInfluence(state, targetPlayer.name)
  } else if (state.pendingAction.action === Actions.Exchange) {
    removeClaimedInfluence(actionPlayer)
    removeUnclaimedInfluence(actionPlayer)
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

    holdGrudge({ state, offended: targetPlayer.name, offender: actionPlayer.name, weight: grudgeSizes[Actions.Steal] })
    const coinsAvailable = Math.min(2, targetPlayer.coins)
    actionPlayer.coins += coinsAvailable
    targetPlayer.coins -= coinsAvailable
  } else if (state.pendingAction.action === Actions.Tax) {
    actionPlayer.coins += 3
  }

  if (!Object.keys(state.pendingInfluenceLoss).length) {
    moveTurnToNextPlayer(state)
  }

  delete state.pendingAction
}

const getEvenlySpacedHueColors = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * 2 * Math.PI
    return `hsl(${angle * (180 / Math.PI)}, 50%, 50%)`
  })

const getNewGameState = (roomId: string, settings: GameSettings): GameState => ({
  roomId,
  availablePlayerColors: shuffle(getEvenlySpacedHueColors(MAX_PLAYER_COUNT)),
  players: [],
  deck: shuffle(createDeckForPlayerCount(0)),
  pendingInfluenceLoss: {},
  isStarted: false,
  eventLogs: [],
  chatMessages: [],
  lastEventTimestamp: new Date(),
  turn: 1,
  settings
})

export const addPlayerToGame = ({
  state,
  playerId,
  playerName,
  ai = false,
  personality,
}: {
  state: GameState
  playerId: string
  playerName: string
  ai?: boolean
  personality?: AiPersonality
}) => {
  const randomPersonality = () => Math.floor(Math.random() * 101)

  state.players.push({
    id: playerId,
    name: playerName,
    coins: 2,
    influences: [],
    deadInfluences: [],
    claimedInfluences: new Set(),
    unclaimedInfluences: new Set(),
    color: state.availablePlayerColors.shift()!,
    ai,
    grudges: {},
    personalityHidden: ai && !personality,
    ...(ai && { personality: personality ?? {
        honesty: randomPersonality(),
        skepticism: randomPersonality(),
        vengefulness: randomPersonality(),
      }})
  })
  state.deck = createDeckForPlayerCount(state.players.length)
}

export const removePlayerFromGame = (state: GameState, playerName: string) => {
  const player = state.players.splice(
    state.players.findIndex(({ name }) => name === playerName),
    1
  )[0]
  state.availablePlayerColors.push(player.color)
  state.deck = createDeckForPlayerCount(state.players.length)
}

export const createNewGame = async (roomId: string, playerId: string, playerName: string, gameSettings: GameSettings) => {
  const newGameState = getNewGameState(roomId, gameSettings)
  addPlayerToGame({ state: newGameState, playerId, playerName })
  await createGameState(roomId, newGameState)
}

export const startGame = (gameState: GameState) => {
  gameState.isStarted = true
  gameState.players = shuffle(gameState.players)
  gameState.players.forEach((player) => {
    player.influences.push(...Array.from({ length: 2 }, () => drawCardFromDeck(gameState)))
  })
  if (gameState.players.length === 2) {
    gameState.players[0].coins = 1
  }
  gameState.turn = 1
  gameState.turnPlayer = gameState.players[0].name
  logEvent(gameState, {
    event: EventMessages.GameStarted
  })
}

export const humanOpponentsRemain = (gameState: GameState, player: Player) =>
  gameState.players.some(({ ai, name, influences }) => !ai && name !== player.name && influences.length)

export const resetGame = async (roomId: string) => {
  const oldGameState = await getGameState(roomId)
  const newGameState = getNewGameState(roomId, oldGameState.settings)
  newGameState.players = oldGameState.players.map((player) => ({
    ...player,
    coins: 2,
    influences: [],
    claimedInfluences: new Set(),
    unclaimedInfluences: new Set(),
    deadInfluences: [],
    grudges: {}
  }))
  newGameState.deck = createDeckForPlayerCount(newGameState.players.length)
  newGameState.availablePlayerColors = oldGameState.availablePlayerColors
  newGameState.chatMessages = oldGameState.chatMessages
  await createGameState(roomId, newGameState)
}

export const revealAndReplaceInfluence = (state: GameState, playerName: string, influence: Influences, log: boolean = true) => {
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
  if (log) {
    logEvent(state, {
      event: EventMessages.PlayerReplacedInfluence,
      primaryPlayer: player.name,
      influence
    })
  }
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

  state.turn++
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
  const offenderPlayer = state.players.find(({ name }) => name === offender)!
  offendedPlayer.grudges[offender] = (offendedPlayer.grudges[offender] ?? 0) + weight
  offenderPlayer.grudges[offended] = (offenderPlayer.grudges[offended] ?? 0) - weight * 0.75
}

export const addClaimedInfluence = (player: Player, influence: Influences) => {
  player.claimedInfluences.add(influence)
}

export const removeClaimedInfluence = (player: Player, influence?: Influences) => {
  if (influence) {
    player.claimedInfluences.delete(influence)
  } else {
    player.claimedInfluences.clear()
  }
}

export const addUnclaimedInfluence = (player: Player, influence: Influences) => {
  player.unclaimedInfluences.add(influence)
}

export const removeUnclaimedInfluence = (player: Player, influence?: Influences) => {
  if (influence) {
    player.unclaimedInfluences.delete(influence)
  } else {
    player.unclaimedInfluences.clear()
  }
}
