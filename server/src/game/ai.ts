import { countOfEachInfluenceDeck } from "../utilities/gameState"
import { Influences, PublicGameState } from "../../../shared/types/game"

export const getProbabilityOfPlayerInfluence = (
  gameState: PublicGameState,
  playerName: string,
  influence: Influences
) => {
  const knownInfluences = [
    ...gameState.selfPlayer?.influences ?? [],
    ...gameState.players.flatMap(({ deadInfluences }) => deadInfluences)
  ]

  const knownMatchedInfluenceCount = knownInfluences.filter((i) => i === influence).length

  if (knownMatchedInfluenceCount === countOfEachInfluenceDeck) {
    return 0
  }

  const totalInfluenceCount =
    gameState.players.reduce((agg, { influenceCount }) => agg + influenceCount, 0) +
    gameState.players.reduce((agg, { deadInfluences }) => agg + deadInfluences.length, 0) +
    gameState.deckCount

  console.log({ countOfEachInfluenceDeck, knownMatchedInfluenceCount, totalInfluenceCount, knownInfluences })

  return (countOfEachInfluenceDeck - knownMatchedInfluenceCount) / (totalInfluenceCount - knownInfluences.length)
}
