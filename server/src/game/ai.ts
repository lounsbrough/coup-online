import { countOfEachInfluenceInDeck } from "../utilities/gameState"
import { Influences, PublicGameState } from "../../../shared/types/game"

export const getProbabilityOfPlayerInfluence = (
  gameState: PublicGameState,
  influence: Influences
) => {
  const knownInfluences = [
    ...gameState.selfPlayer?.influences ?? [],
    ...gameState.players.flatMap(({ deadInfluences }) => deadInfluences)
  ]

  const knownMatchedInfluenceCount = knownInfluences.filter((i) => i === influence).length

  if (knownMatchedInfluenceCount === countOfEachInfluenceInDeck) {
    return 0
  }

  const totalInfluenceCount =
    gameState.players.reduce((agg, { influenceCount }) => agg + influenceCount, 0) +
    gameState.players.reduce((agg, { deadInfluences }) => agg + deadInfluences.length, 0) +
    gameState.deckCount

  return (countOfEachInfluenceInDeck - knownMatchedInfluenceCount) / (totalInfluenceCount - knownInfluences.length)
}
