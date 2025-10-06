import { ActionAttributes, Actions, InfluenceAttributes, Influences, Player, PlayerActions, PublicGameState, PublicPlayer, Responses } from "../../../shared/types/game"
import { randomlyDecideToBluff, randomlyDecideToNotUseOwnedInfluence } from "./aiRandomness"
import { shuffle } from "../utilities/array"
import { getCountOfEachInfluence } from "../utilities/deck"
import { getGameState, getPublicGameState } from '../utilities/gameState'
import { UnableToFindPlayerError } from '../utilities/errors'
import { canPlayerChooseAction, canPlayerChooseActionChallengeResponse, canPlayerChooseActionResponse, canPlayerChooseBlockChallengeResponse, canPlayerChooseBlockResponse } from '../../../shared/game/logic'

const getRevealedInfluences = (gameState: PublicGameState, influence?: Influences) =>
  gameState.players.reduce((agg: Influences[], { deadInfluences }) => {
    deadInfluences.forEach((i) => {
      if (!influence || i === influence) agg.push(i)
    })
    return agg
  }, [])

const getProbabilityOfHiddenCardBeingInfluence = (
  gameState: PublicGameState,
  influence: Influences
) => {
  const knownInfluences = [
    ...gameState.selfPlayer?.influences ?? [],
    ...getRevealedInfluences(gameState)
  ]

  const knownMatchedInfluenceCount = knownInfluences.filter((i) => i === influence).length

  const countOfEachInfluence = getCountOfEachInfluence(gameState.players.length)

  if (knownMatchedInfluenceCount === countOfEachInfluence) {
    return 0
  }

  const totalInfluenceCount =
    gameState.players.reduce((agg, { influenceCount }) => agg + influenceCount, 0) +
    gameState.players.reduce((agg, { deadInfluences }) => agg + deadInfluences.length, 0) +
    gameState.deckCount

  return (countOfEachInfluence - knownMatchedInfluenceCount) / (totalInfluenceCount - knownInfluences.length)
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

  return player.influenceCount * 10 + player.coins
}

export const getOpponents = (gameState: PublicGameState): PublicPlayer[] =>
  gameState.players.filter(({ name, influenceCount }) =>
    influenceCount && name !== gameState.selfPlayer?.name)

const checkRequiredTargetPlayer = (gameState: PublicGameState) => {
  const opponents = getOpponents(gameState)

  // If only one opponent would remain, target the one who could Coup you on the next round.
  if (opponents.length === 2 && opponents[0].influenceCount === 1 && opponents[1].influenceCount === 1) {
    if (opponents[0].coins >= 7 && opponents[1].coins < 7) {
      return opponents[0]
    }
    if (opponents[1].coins >= 7 && opponents[0].coins < 7) {
      return opponents[1]
    }
  }
}

const getPossibleTargetPlayers = (
  gameState: PublicGameState,
  condition: (player: PublicPlayer) => boolean
) => getOpponents(gameState).filter(condition)

const decideCoupTarget = (gameState: PublicGameState) => {
  const requiredTarget = checkRequiredTargetPlayer(gameState)
  if (requiredTarget) return requiredTarget

  const opponents = getOpponents(gameState)

  const vengefulness = (gameState.selfPlayer?.personality?.vengefulness ?? 50) / 100
  const opponentAffinities: [number, PublicPlayer][] = opponents.map((opponent) => {
    const dangerFactor = getPlayerDangerFactor(opponent)
    const revengeFactor = (gameState.selfPlayer?.grudges[opponent.name] ?? 0) * vengefulness * 2
    return [dangerFactor + revengeFactor + Math.random() * 3, opponent]
  })

  return opponentAffinities.sort((a, b) => b[0] - a[0])[0][1]
}

const decideAssasinationTarget = (gameState: PublicGameState) => {
  const requiredTarget = checkRequiredTargetPlayer(gameState)
  if (requiredTarget) return requiredTarget

  const opponents = getOpponents(gameState)

  const skepticism = (gameState.selfPlayer?.personality?.skepticism ?? 50) / 100

  const vengefulness = (gameState.selfPlayer?.personality?.vengefulness ?? 50) / 100
  const opponentAffinities: [number, PublicPlayer][] = opponents.map((opponent) => {
    const dangerFactor = getPlayerDangerFactor(opponent)
    const revengeFactor = (gameState.selfPlayer?.grudges[opponent.name] ?? 0) * vengefulness * 2
    const contessaFactor = opponent.claimedInfluences.has(Influences.Contessa) ? -10 - 10 * (1 - skepticism) : 0
    return [dangerFactor + revengeFactor + contessaFactor + Math.random() * 3, opponent]
  })

  // TODO: return affinity as well to decide if action should even be taken
  return opponentAffinities.sort((a, b) => b[0] - a[0])[0][1]
}

const checkEndGameAction = (gameState: PublicGameState): {
  action: Actions
  targetPlayer?: string
} | null => {
  const opponents = getOpponents(gameState)

  if (opponents.length === 1 && opponents[0].influenceCount === 1 && gameState.selfPlayer!.coins >= 7) {
    return { action: Actions.Coup, targetPlayer: opponents[0].name }
  }

  if (gameState.selfPlayer?.influences.length === 1) {
    if (opponents.length === 1 && opponents[0].coins >= 7) {
      if (opponents[0].influenceCount === 1 && gameState.selfPlayer.coins >= 7) {
        return { action: Actions.Coup, targetPlayer: opponents[0].name }
      }

      const assassinate = { action: Actions.Assassinate, targetPlayer: opponents[0].name }
      const steal = { action: Actions.Steal, targetPlayer: opponents[0].name }

      if (gameState.selfPlayer.coins < 3) {
        return steal
      }

      if (opponents[0].coins >= 9) {
        return assassinate
      }

      if (gameState.selfPlayer.influences.includes(Influences.Assassin)) {
        return assassinate
      }

      if (gameState.selfPlayer.influences.includes(Influences.Captain)) {
        return steal
      }

      const chanceOfAssassin = getProbabilityOfPlayerInfluence(gameState, Influences.Assassin, gameState.selfPlayer.name)
      const chanceOfCaptain = getProbabilityOfPlayerInfluence(gameState, Influences.Captain, gameState.selfPlayer.name)

      if ((chanceOfAssassin === 0 && chanceOfCaptain === 0) || chanceOfAssassin === chanceOfCaptain) {
        return Math.random() > 0.5 ? assassinate : steal
      }

      return chanceOfAssassin + Math.random() * 0.1 > chanceOfCaptain + Math.random() * 0.1
       ? assassinate : steal
    }
  }

  return null
}

const checkEndGameBlockResponse = (gameState: PublicGameState): {
  response: Responses
} | null => {
  if (gameState.selfPlayer?.influences.length === 1) {
    const opponents = getOpponents(gameState)

    if (opponents.length === 1 && opponents[0].coins >= 7) {
      return { response: Responses.Challenge }
    }
  }

  return null
}

const getFinalBluffMargin = (
  baseBluffMargin: number,
  influence: Influences,
  self: Player
) => {
  let finalBluffMargin = baseBluffMargin
  if (self.unclaimedInfluences.has(influence)) {
    finalBluffMargin *= 0.2
  }
  if (self.claimedInfluences.has(influence)) {
    finalBluffMargin *= 5
  }
  return finalBluffMargin
}


export const decideAction = (gameState: PublicGameState): {
  action: Actions
  targetPlayer?: string
} => {
  if (!gameState.selfPlayer) {
    throw new Error('AI could not determine self player')
  }

  const endGameAction = checkEndGameAction(gameState)
  if (endGameAction) return endGameAction

  let willCoup = false
  let willRevive = false
  if (gameState.selfPlayer?.coins >= 10) {
    if (gameState.settings.allowRevive
      && gameState.selfPlayer.influences.length === 1
      && Math.random() > 0.2) {
      willRevive = true
    } else {
      willCoup = true
    }
  } else if (gameState.selfPlayer?.coins >= 7) {
    willCoup = Math.random() > 0.5
  }

  if (willCoup) {
    const targetPlayer = decideCoupTarget(gameState)
    return { action: Actions.Coup, targetPlayer: targetPlayer.name }
  }

  if (willRevive) return { action: Actions.Revive }

  const honesty = (gameState.selfPlayer.personality?.honesty ?? 50) / 100
  const skepticism = (gameState.selfPlayer.personality?.skepticism ?? 50) / 100

  const baseBluffMargin = (1 - honesty) ** 1.5 * 0.3
  const getFinalBluffMarginForAction = (influence: Influences) =>
    getFinalBluffMargin(baseBluffMargin, influence, gameState.selfPlayer!)

  if (
    getProbabilityOfPlayerInfluence(gameState, Influences.Duke) > 0 && (
      (!randomlyDecideToNotUseOwnedInfluence() && gameState.selfPlayer.influences.includes(Influences.Duke))
      || randomlyDecideToBluff(getFinalBluffMarginForAction(Influences.Duke))
    )
  ) {
    return { action: Actions.Tax }
  }

  if (
    getProbabilityOfPlayerInfluence(gameState, Influences.Captain) > 0 && (
      (!randomlyDecideToNotUseOwnedInfluence() && gameState.selfPlayer.influences.includes(Influences.Captain))
      || randomlyDecideToBluff(getFinalBluffMarginForAction(Influences.Captain))
    )
  ) {
    const getProbabilityOfBlockingSteal = (playerName: string) =>
      getProbabilityOfPlayerInfluence(gameState, Influences.Captain, playerName)
      + getProbabilityOfPlayerInfluence(gameState, Influences.Ambassador, playerName)

    const possibleTargets = getPossibleTargetPlayers(gameState, ({ coins }) => coins > 0)

    let minBlockingAbility = Infinity
    const bestTargets: PublicPlayer[] = []
    possibleTargets.forEach((possibleTarget) => {
      const blockingAbility =
        (possibleTarget.claimedInfluences.has(Influences.Captain) ? (0.5 * (1.5 - skepticism)) : 0)
        + (possibleTarget.claimedInfluences.has(Influences.Ambassador) ? (0.5 * (1.5 - skepticism)) : 0)
        - (possibleTarget.unclaimedInfluences.has(Influences.Captain) ? (0.5 * (1.5 - skepticism)) : 0)
        - (possibleTarget.unclaimedInfluences.has(Influences.Ambassador) ? (0.5 * (1.5 - skepticism)) : 0)
        + getProbabilityOfBlockingSteal(possibleTarget.name)

      if (blockingAbility < minBlockingAbility) {
        minBlockingAbility = blockingAbility
        bestTargets.length = 0
      }

      if (blockingAbility <= minBlockingAbility) {
        bestTargets.push(possibleTarget)
      }
    })

    if (bestTargets.length && minBlockingAbility < 0.99) {
      const chosenTarget = bestTargets[Math.floor(Math.random() * bestTargets.length)]
      return { action: Actions.Steal, targetPlayer: chosenTarget.name }
    }
  }

  if (
    getProbabilityOfPlayerInfluence(gameState, Influences.Ambassador) > 0 && (
      (!randomlyDecideToNotUseOwnedInfluence() && gameState.selfPlayer.influences.includes(Influences.Ambassador))
      || randomlyDecideToBluff(getFinalBluffMarginForAction(Influences.Ambassador))
    )
  ) {
    return { action: Actions.Exchange }
  }

  if (
    getProbabilityOfPlayerInfluence(gameState, Influences.Assassin) > 0
    && gameState.selfPlayer.coins >= 3 && (
      (!randomlyDecideToNotUseOwnedInfluence() && gameState.selfPlayer.influences.includes(Influences.Assassin))
      || randomlyDecideToBluff(getFinalBluffMarginForAction(Influences.Assassin))
    )
  ) {
    const targetPlayer = decideAssasinationTarget(gameState)
    return { action: Actions.Assassinate, targetPlayer: targetPlayer.name }
  }

  const claimedDukeCount = gameState.players.filter(({ claimedInfluences }) => claimedInfluences.has(Influences.Duke)).length
  if (claimedDukeCount * (0.35 - skepticism * 0.35) + getProbabilityOfPlayerInfluence(gameState, Influences.Duke) < 0.25 + Math.random() * 0.1) {
    return { action: Actions.ForeignAid }
  }

  return { action: Actions.Income }
}

export const decideActionResponse = (gameState: PublicGameState): {
  response: Responses
  claimedInfluence?: Influences
} => {
  if (!gameState.selfPlayer) {
    throw new Error('AI could not determine self player')
  }

  const requiredInfluenceForAction = ActionAttributes[gameState.pendingAction!.action].influenceRequired
  const isSelfTarget = gameState.pendingAction?.targetPlayer === gameState.selfPlayer.name
  const honesty = (gameState.selfPlayer.personality?.honesty ?? 50) / 100
  const skepticism = (gameState.selfPlayer.personality?.skepticism ?? 50) / 100

  const skepticismMargin = skepticism ** 2 * ((isSelfTarget ? 0.8 : 0.4) + Math.random() * 0.1)

  const turnPlayer = gameState.players.find(({ name }) => name === gameState.turnPlayer)

  const isChallengeable = requiredInfluenceForAction && !gameState.pendingAction?.claimConfirmed

  if (
    isChallengeable
    && getProbabilityOfPlayerInfluence(gameState, requiredInfluenceForAction, gameState.turnPlayer) === 0
  ) {
    return { response: Responses.Challenge }
  }

  const isBlockable = (
    ActionAttributes[gameState.pendingAction!.action].blockable
    && (
      gameState.pendingAction?.targetPlayer === gameState.selfPlayer.name
      || gameState.pendingAction!.action === Actions.ForeignAid
    )
  )

  const legalBlockInfluences = shuffle(Object.entries(InfluenceAttributes).reduce((agg, [influence, { legalBlock }]) => {
    if (legalBlock === gameState.pendingAction?.action) {
      agg.push(influence as Influences)
    }
    return agg
  }, [] as Influences[]))

  if (isBlockable) {
    for (const legalBlockInfluence of legalBlockInfluences) {
      const hasLegalBlockingInfluence = gameState.selfPlayer?.influences.some((i) => i === legalBlockInfluence)
      if (hasLegalBlockingInfluence && !randomlyDecideToNotUseOwnedInfluence()) {
        return { response: Responses.Block, claimedInfluence: legalBlockInfluence }
      }
    }
  }

  if (
    isChallengeable
    && getProbabilityOfPlayerInfluence(gameState, requiredInfluenceForAction, gameState.turnPlayer) <= skepticismMargin
    && (
      !turnPlayer?.claimedInfluences.has(requiredInfluenceForAction)
      || turnPlayer?.unclaimedInfluences.has(requiredInfluenceForAction)
      || Math.random() < skepticismMargin
    )
  ) {
    return { response: Responses.Challenge }
  }

  if (isBlockable) {
    for (const legalBlockInfluence of legalBlockInfluences) {
      const baseBluffMargin = (1 - honesty) ** 1.5 * ((isSelfTarget ? 0.4 : 0.2) + Math.random() * 0.1)
      const finalBluffMargin = getFinalBluffMargin(baseBluffMargin, legalBlockInfluence, gameState.selfPlayer)

      if (
        randomlyDecideToBluff(finalBluffMargin)
        && getProbabilityOfPlayerInfluence(gameState, legalBlockInfluence) > 0
      ) {
        return { response: Responses.Block, claimedInfluence: legalBlockInfluence }
      }
    }
  }

  if (gameState.pendingAction?.action === Actions.Assassinate
    && gameState.pendingAction.targetPlayer === gameState.selfPlayer?.name
    && gameState.selfPlayer?.influences.length === 1
  ) {
    const probabilityOfAssassin = getProbabilityOfPlayerInfluence(gameState, Influences.Assassin, gameState.turnPlayer)
    const probabilityOfContessa = getProbabilityOfPlayerInfluence(gameState, Influences.Contessa, gameState.selfPlayer.name)

    if (probabilityOfAssassin === 0 || probabilityOfContessa === 0) {
      return { response: Responses.Challenge }
    }

    return probabilityOfAssassin > 0.4 + Math.random() * 0.2
      ? { response: Responses.Block, claimedInfluence: Influences.Contessa }
      : { response: Responses.Challenge }
  }

  return { response: Responses.Pass }
}

export const decideActionChallengeResponse = (gameState: PublicGameState): {
  influence: Influences
} => {
  const requiredInfluence = ActionAttributes[gameState.pendingAction!.action].influenceRequired
  const revealedInfluence = requiredInfluence && gameState.selfPlayer?.influences.some((i) => i === requiredInfluence)
    ? requiredInfluence
    : gameState.selfPlayer!.influences[Math.floor(Math.random() * gameState.selfPlayer!.influences.length)]

  return { influence: revealedInfluence }
}

export const decideBlockResponse = (gameState: PublicGameState): {
  response: Responses
} => {
  const skepticism = (gameState.selfPlayer?.personality?.skepticism ?? 50) / 100

  const endGameBlockResponse = checkEndGameBlockResponse(gameState)
  if (endGameBlockResponse) {
    return endGameBlockResponse
  }

  const isSelfAction = gameState.turnPlayer === gameState.selfPlayer?.name
  const skepticismMargin = skepticism ** 2 * ((isSelfAction ? 0.8 : 0.4) + Math.random() * 0.1)
  if (getProbabilityOfPlayerInfluence(gameState, gameState.pendingBlock!.claimedInfluence, gameState.pendingBlock!.sourcePlayer) <= skepticismMargin
    && (!gameState.players.find(({ name }) => name === gameState.pendingBlock!.sourcePlayer)?.claimedInfluences.has(gameState.pendingBlock!.claimedInfluence) || Math.random() < skepticismMargin)) {
    return { response: Responses.Challenge }
  }

  return { response: Responses.Pass }
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

export const getPlayerSuggestedMove = async ({ roomId, playerId }: {
  roomId: string
  playerId: string
}) => {
  const gameState = await getGameState(roomId)
  const player = gameState.players.find(({ id }) => id === playerId)

  if (!player) {
    throw new UnableToFindPlayerError()
  }

  const playersLeft = gameState.players.filter(({ influences }) => influences.length)
  const gameIsOver = playersLeft.length === 1

  if (gameIsOver) {
    return null
  }

  const playerState = getPublicGameState({ gameState, playerId })

  const pendingLossPlayers = Object.keys(gameState.pendingInfluenceLoss)
  if (pendingLossPlayers.includes(player.name)) {
    const { influences } = decideInfluencesToLose(playerState)

    return [PlayerActions.loseInfluences, {
      roomId,
      playerId,
      influences
    }]
  }

  if (canPlayerChooseAction(playerState)) {
    const { action, targetPlayer } = decideAction(playerState)

    return [PlayerActions.action, {
      roomId,
      playerId,
      action,
      ...(targetPlayer && { targetPlayer })
    }]
  }

  if (canPlayerChooseActionResponse(playerState)) {
    const { response, claimedInfluence } = decideActionResponse(playerState)

    return [PlayerActions.actionResponse, {
      roomId,
      playerId,
      response,
      ...(claimedInfluence && { claimedInfluence })
    }]
  }

  if (canPlayerChooseActionChallengeResponse(playerState)) {
    const { influence } = decideActionChallengeResponse(playerState)

    return [PlayerActions.actionChallengeResponse, {
      roomId,
      playerId,
      influence
    }]
  }

  if (canPlayerChooseBlockResponse(playerState)) {
    const { response } = decideBlockResponse(playerState)

    return [PlayerActions.blockResponse, {
      roomId,
      playerId,
      response
    }]
  }

  if (canPlayerChooseBlockChallengeResponse(playerState)) {
    const { influence } = decideBlockChallengeResponse(playerState)

    return [PlayerActions.blockChallengeResponse, {
      roomId,
      playerId,
      influence
    }]
  }

  return null
}
