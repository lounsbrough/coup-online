import { countOfEachInfluenceInDeck } from "../utilities/gameState"
import { Actions, Influences, PublicGameState, PublicPlayer } from "../../../shared/types/game"

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

export const getPlayerDangerFactor = (player: PublicPlayer) => {
  if (!player.influenceCount) {
    return 0
  }

  const dangerFactor = player.influenceCount * 10 + player.coins

  return dangerFactor
}

export const decideAction = (gameState: PublicGameState): {
  action: Actions
  targetPlayer?: string
} => {
  if (!gameState.selfPlayer) {
    throw new Error('AI could not determine self player')
  }

  const opponents = gameState.players.filter(({ influenceCount, name }) =>
    influenceCount && name !== gameState.selfPlayer?.name)

  let willCoup = false
  if (gameState.selfPlayer?.coins >= 10) {
    willCoup = true
  } else if (gameState.selfPlayer?.coins >= 7) {
    if (opponents.length === 1 && opponents[0].influenceCount === 1) {
      willCoup = true
    } else {
      willCoup = Math.random() > 0.5
    }
  }

  if (willCoup) {
    const targetPlayer = opponents.sort((a, b) =>
      getPlayerDangerFactor(b) * Math.random() * 0.05 -
      getPlayerDangerFactor(a) * Math.random() * 0.05)[0]

    return { action: Actions.Coup, targetPlayer: targetPlayer.name }
  }

  return { action: Actions.Income }
}
