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

  const waitingOnNames = new Set<string>()

  if (gameState.pendingBlockChallenge) {
    const pendingBlockPlayer = gameState.pendingBlock?.sourcePlayer
    if (pendingBlockPlayer) {
      waitingOnNames.add(pendingBlockPlayer)
    }
  } else if (gameState.pendingBlock) {
    gameState.pendingBlock?.pendingPlayers.forEach(waitingOnNames.add, waitingOnNames)
  } else if (gameState.pendingActionChallenge) {
    if (gameState.turnPlayer) {
      waitingOnNames.add(gameState.turnPlayer)
    }
  } else if (gameState.pendingAction) {
    gameState.pendingAction?.pendingPlayers.forEach(waitingOnNames.add, waitingOnNames)
  }

  const pendingInfluenceLossPlayers = Object.keys(gameState.pendingInfluenceLoss)
  if (pendingInfluenceLossPlayers.length) {
    pendingInfluenceLossPlayers.forEach(waitingOnNames.add, waitingOnNames)
  }

  if (!waitingOnNames.size) {
    if (gameState.turnPlayer) {
      waitingOnNames.add(gameState.turnPlayer)
    }
  }

  return gameState.players.filter(({ name }) => waitingOnNames.has(name))
}
