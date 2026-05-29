import { getCountOfEachInfluence } from "../../../shared/helpers/playerCount"
import { GameSettings, Influences } from "../../../shared/types/game"
import { getInfluencesForGame } from "../../../shared/game/logic"
import { shuffle } from "./array"

export { getInfluencesForGame, getCountOfEachInfluence }

export const createDeckForPlayerCount = (playerCount: number, settings?: GameSettings): Influences[] => {
  const count = getCountOfEachInfluence(playerCount)
  const influences = settings ? getInfluencesForGame(settings) : Object.values(Influences).filter((i) => i !== Influences.Inquisitor)
  return shuffle(influences.flatMap((influence) => Array.from({ length: count }, () => influence)))
}
