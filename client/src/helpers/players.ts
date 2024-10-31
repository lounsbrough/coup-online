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

  const waitingForNames = new Set<string>()

  if (gameState.pendingBlockChallenge) {
    const pendingBlockPlayer = gameState.pendingBlock?.sourcePlayer
    if (pendingBlockPlayer) {
      waitingForNames.add(pendingBlockPlayer)
    }
  } else if (gameState.pendingBlock) {
    gameState.pendingBlock?.pendingPlayers.forEach(waitingForNames.add, waitingForNames)
  } else if (gameState.pendingActionChallenge) {
    if (gameState.turnPlayer) {
      waitingForNames.add(gameState.turnPlayer)
    }
  } else if (gameState.pendingAction) {
    gameState.pendingAction?.pendingPlayers.forEach(waitingForNames.add, waitingForNames)
  }

  const pendingInfluenceLossPlayers = Object.keys(gameState.pendingInfluenceLoss)
  if (pendingInfluenceLossPlayers.length) {
    pendingInfluenceLossPlayers.forEach(waitingForNames.add, waitingForNames)
  }

  if (!waitingForNames.size) {
    if (gameState.turnPlayer) {
      waitingForNames.add(gameState.turnPlayer)
    }
  }

  return gameState.players.filter(({ name }) => waitingForNames.has(name))
}
