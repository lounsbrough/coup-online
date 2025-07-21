import { MAX_PLAYER_COUNT } from "../../../shared/helpers/playerCount"
import { Influences } from "../../../shared/types/game"
import { shuffle } from "./array"

export const getCountOfEachInfluence = (playerCount: number): number => {
  if (playerCount >= 0 && playerCount <= 6) {
    return 3
  }

  if (playerCount >= 7 && playerCount <= 8) {
    return 4
  }

  if (playerCount >= 9 && playerCount <= MAX_PLAYER_COUNT) {
    return 5
  }

  throw new Error(`Invalid player count: ${playerCount}`)
}

export const createDeckForPlayerCount = (playerCount: number): Influences[] => {
  const count = getCountOfEachInfluence(playerCount)
  return shuffle(Object.values(Influences).flatMap((influence) => Array.from({ length: count }, () => influence)))
}
