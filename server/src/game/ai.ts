import { countOfEachInfluenceInDeck } from "../utilities/gameState"
import { ActionAttributes, Actions, InfluenceAttributes, Influences, PublicGameState, PublicPlayer, Responses } from "../../../shared/types/game"

export const getProbabilityOfHiddenCardBeingInfluence = (
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

export const getProbabilityOfPlayerInfluence = (
  gameState: PublicGameState,
  influence: Influences,
  playerName?: string
) => {
  if (playerName) {
    const player = gameState.players.find(({ name }) => name === playerName)
    if (!player) {
      throw new Error('Player not found for probability function')
    }

    return player.influenceCount * getProbabilityOfHiddenCardBeingInfluence(gameState, influence)
  }

  const hiddenInfluenceCount =
    gameState.players.reduce((agg, { influenceCount }) => agg + influenceCount, 0)
    - (gameState.selfPlayer?.influences.length ?? 0)

  return hiddenInfluenceCount * getProbabilityOfHiddenCardBeingInfluence(gameState, influence)
}

export const getPlayerDangerFactor = (player: PublicPlayer) => {
  if (!player.influenceCount) {
    return 0
  }

  const dangerFactor = player.influenceCount * 10 + player.coins

  return dangerFactor
}

export const getTargetPlayer = (gameState: PublicGameState) => {
  const opponents = gameState.players.filter(({ influenceCount, name }) =>
    influenceCount && name !== gameState.selfPlayer?.name)

  return opponents.sort((a, b) =>
    getPlayerDangerFactor(b) * Math.random() * 0.05 -
    getPlayerDangerFactor(a) * Math.random() * 0.05)[0]
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
    const targetPlayer = getTargetPlayer(gameState)
    return { action: Actions.Coup, targetPlayer: targetPlayer.name }
  }

  if (gameState.selfPlayer.influences.includes(Influences.Captain) || Math.random() > 0.95) {
    if (getProbabilityOfPlayerInfluence(gameState, Influences.Captain) < 0.1 + Math.random() * 0.1) {
      const targetPlayer = getTargetPlayer(gameState)
      return { action: Actions.Steal, targetPlayer: targetPlayer.name }
      // TODO: check for soft target, needs to track in state
      // eslint-disable-next-line no-constant-condition, no-empty
    } else if (false) { }
  }

  if (gameState.selfPlayer.influences.includes(Influences.Duke) || Math.random() > 0.95) {
    return { action: Actions.Tax }
  }

  if (gameState.selfPlayer.influences.includes(Influences.Ambassador) || Math.random() > 0.95) {
    return { action: Actions.Exchange }
  }

  if ((gameState.selfPlayer.influences.includes(Influences.Assassin) || Math.random() > 0.95)
    && gameState.selfPlayer.coins >= 3) {
    const targetPlayer = getTargetPlayer(gameState)
    return { action: Actions.Assassinate, targetPlayer: targetPlayer.name }
  }

  if (getProbabilityOfPlayerInfluence(gameState, Influences.Duke) < 0.1 + Math.random() * 0.1) {
    return { action: Actions.ForeignAid }
  }

  return { action: Actions.Income }
}

export const decideActionResponse = (gameState: PublicGameState): {
  response: Responses
  claimedInfluence?: Influences
} => {
  if (ActionAttributes[gameState.pendingAction!.action].blockable
    && gameState.pendingAction?.targetPlayer === gameState.selfPlayer?.name) {
    const requiredInfluenceForBlock = Object.entries(InfluenceAttributes)
      .find(([, { legalBlock }]) => legalBlock === gameState.pendingAction?.action)
      ?.[0] as Influences | undefined

    if (requiredInfluenceForBlock
      && (
        gameState.selfPlayer?.influences.some((i) => i === requiredInfluenceForBlock)
        || (Math.random() > 0.2 && getProbabilityOfHiddenCardBeingInfluence(gameState, requiredInfluenceForBlock) > 0)
      )) {
      return { response: Responses.Block, claimedInfluence: requiredInfluenceForBlock }
    }
  }

  const requiredInfluenceForAction = Object.entries(InfluenceAttributes)
    .find(([, { legalAction }]) => legalAction === gameState.pendingAction?.action)
    ?.[0] as Influences | undefined
  if (requiredInfluenceForAction && getProbabilityOfPlayerInfluence(gameState, requiredInfluenceForAction, gameState.turnPlayer) < (0.05 + Math.random() * 0.05)) {
    return { response: Responses.Challenge }
  }

  return Math.random() > 0.1 || gameState.pendingAction?.claimConfirmed
    ? { response: Responses.Pass }
    : { response: Responses.Challenge }
}

export const decideActionChallengeResponse = (gameState: PublicGameState): {
  influence: Influences
} => {
  const requiredInfluence = Object.entries(InfluenceAttributes)
    .find(([, { legalAction }]) => legalAction === gameState.pendingAction?.action)
    ?.[0] as Influences | undefined

  const revealedInfluence = requiredInfluence && gameState.selfPlayer?.influences.some((i) => i === requiredInfluence)
    ? requiredInfluence
    : gameState.selfPlayer!.influences[Math.floor(Math.random() * gameState.selfPlayer!.influences.length)]

  return { influence: revealedInfluence }
}

export const decideBlockResponse = (gameState: PublicGameState): {
  response: Responses
} => {
  if (getProbabilityOfPlayerInfluence(gameState, gameState.pendingBlock!.claimedInfluence, gameState.pendingBlock!.sourcePlayer) < (0.05 + Math.random() * 0.05)) {
    return { response: Responses.Challenge }
  }

  return Math.random() > 0.1
    ? { response: Responses.Pass }
    : { response: Responses.Challenge }
}

export const decideBlockChallengeResponse = (gameState: PublicGameState): {
  influence: Influences
} => {
  const revealedInfluence = gameState.selfPlayer?.influences.some((i) => i === gameState.pendingBlock!.claimedInfluence)
    ? gameState.pendingBlock!.claimedInfluence
    : gameState.selfPlayer!.influences[Math.floor(Math.random() * gameState.selfPlayer!.influences.length)]

  return { influence: revealedInfluence }
}

export const decideInfluencesToLose = (gameState: PublicGameState): {
  influences: Influences[]
} => {
  const currentInfluences = [...gameState.selfPlayer!.influences]

  const lostInfluences = gameState.pendingInfluenceLoss[gameState.selfPlayer!.name].map(() =>
    currentInfluences.splice(Math.floor(Math.random() * currentInfluences.length), 1)[0]
  )

  return { influences: lostInfluences }
}
