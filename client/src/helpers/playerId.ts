import { v4 as uuidv4 } from 'uuid'
import { playerIdStorageKey } from './localStorageKeys'

export const getPlayerId = () => {
  const existingPlayerId = localStorage.getItem(playerIdStorageKey)
  if (existingPlayerId) {
    return existingPlayerId
  }

  const playerId = uuidv4()
  localStorage.setItem(playerIdStorageKey, playerId)
  return playerId
}
