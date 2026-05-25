import { PublicGameState } from "../types/game"

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
