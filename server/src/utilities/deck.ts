import { MAX_PLAYER_COUNT } from "../../../shared/helpers/playerCount"
import { GameSettings, Influences } from "../../../shared/types/game"
import { getInfluencesForGame } from "../../../shared/game/logic"
import { shuffle } from "./array"

export { getInfluencesForGame }

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

export const createDeckForPlayerCount = (playerCount: number, settings?: GameSettings): Influences[] => {
  const count = getCountOfEachInfluence(playerCount)
  const influences = settings ? getInfluencesForGame(settings) : Object.values(Influences).filter((i) => i !== Influences.Inquisitor)
  return shuffle(influences.flatMap((influence) => Array.from({ length: count }, () => influence)))
}
