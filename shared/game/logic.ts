import { Actions, InfluenceAttributes, Influences, PublicGameState } from "../types/game"

export const getInfluenceRequiredForAction = (action: Actions, settings: { useInquisitor?: boolean }): Influences | undefined => {
  const validInfluences = Object.entries(InfluenceAttributes)
    .filter(([, attrs]) => attrs.legalActions.includes(action))
    .map(([influence]) => influence as Influences)

  if (validInfluences.length <= 1) return validInfluences[0]

  if (action === Actions.Exchange) {
    return settings.useInquisitor ? Influences.Inquisitor : Influences.Ambassador
  }

  throw new Error(`Multiple influences can perform action "${action}" but no resolution logic exists`)
}

export const canInfluenceLegallyPerformAction = (influence: Influences, action: Actions): boolean => {
  return InfluenceAttributes[influence].legalActions.includes(action)
}

export const canPlayerChooseAction = (state: PublicGameState) =>
  state.selfPlayer
  && state.turnPlayer === state.selfPlayer.name
  && !state.pendingAction
  && !state.pendingExamine
  && !Object.keys(state.pendingInfluenceLoss).length

export const canPlayerChooseActionResponse = (state: PublicGameState) =>
  state.selfPlayer
  && state.turnPlayer !== state.selfPlayer.name
  && state.pendingAction
  && !state.pendingActionChallenge
  && !state.pendingBlock
  && state.pendingAction.pendingPlayers.has(state.selfPlayer.name)

export const canPlayerChooseActionChallengeResponse = (state: PublicGameState) =>
  state.selfPlayer
  && state.turnPlayer === state.selfPlayer.name
  && state.pendingActionChallenge

export const canPlayerChooseBlockResponse = (state: PublicGameState) =>
  state.selfPlayer
  && state.pendingBlock
  && !state.pendingBlockChallenge
  && state.pendingBlock.sourcePlayer !== state.selfPlayer.name
  && state.pendingBlock.pendingPlayers.has(state.selfPlayer.name)

export const canPlayerChooseBlockChallengeResponse = (state: PublicGameState) =>
  state.selfPlayer
  && state.pendingBlock
  && state.pendingBlockChallenge
  && state.pendingBlock.sourcePlayer === state.selfPlayer.name

export const canPlayerRevealForExamine = (state: PublicGameState) =>
  state.selfPlayer
  && state.pendingExamine
  && state.pendingExamine.targetPlayer === state.selfPlayer.name
  && !state.pendingExamine.revealedInfluence

export const canPlayerMakeExamineDecision = (state: PublicGameState) =>
  state.selfPlayer
  && state.pendingExamine
  && state.pendingExamine.examiner === state.selfPlayer.name
  && !!state.pendingExamine.revealedInfluence
