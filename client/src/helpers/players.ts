import { v4 as uuidv4 } from 'uuid'
import { playerIdStorageKey } from './localStorageKeys'
import { PublicGameState, PublicPlayer } from '@shared'

export const getPlayerId = () => {
  const existingPlayerId = localStorage.getItem(playerIdStorageKey)
  if (existingPlayerId) {
    return existingPlayerId
  }

  const playerId = uuidv4()
  localStorage.setItem(playerIdStorageKey, playerId)
  return playerId
}

export const getWaitingOnPlayers = (gameState: PublicGameState): PublicPlayer[] => {
  const playersLeft = gameState.players.filter(({ influenceCount }) => influenceCount)
  if (playersLeft.length === 1) {
    return []
  }

  const waitingForPlayers = []

  if (gameState.pendingBlockChallenge) {
    const pendingBlockPlayer = gameState.players.find(({ name }) => gameState.pendingBlock?.sourcePlayer === name)
    if (pendingBlockPlayer) {
      waitingForPlayers.push(pendingBlockPlayer)
    }
  } else if (gameState.pendingBlock) {
    waitingForPlayers.push(...gameState.players.filter(({ name }) =>
      gameState.pendingBlock?.pendingPlayers.includes(name)))
  } else if (gameState.pendingActionChallenge) {
    const turnPlayer = gameState.players.find(({ name }) => gameState.turnPlayer === name)
    if (turnPlayer) {
      waitingForPlayers.push(turnPlayer)
    }
  } else if (gameState.pendingAction) {
    waitingForPlayers.push(...gameState.players.filter(({ name }) =>
      gameState.pendingAction?.pendingPlayers.includes(name)))
  }

  const pendingInfluenceLossPlayers = Object.keys(gameState.pendingInfluenceLoss)
  if (pendingInfluenceLossPlayers.length) {
    pendingInfluenceLossPlayers.forEach((pendingInfluenceLossPlayer) => {
      waitingForPlayers.push(gameState.players.find(({ name }) => pendingInfluenceLossPlayer === name))
    })
  }

  if (!waitingForPlayers.length) {
    const turnPlayer = gameState.players.find(({ name }) => gameState.turnPlayer === name)
    if (turnPlayer) {
      waitingForPlayers.push(turnPlayer)
    }
  }

  return waitingForPlayers
}
