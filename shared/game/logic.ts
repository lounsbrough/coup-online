import { PublicGameState } from "../types/game"

export const canPlayerChooseAction = (state: PublicGameState) =>
  state.selfPlayer
  && state.turnPlayer === state.selfPlayer.name
  && !state.pendingAction
  && !Object.keys(state.pendingInfluenceLoss).length

export const canPlayerChooseActionResponse = (state: PublicGameState) =>
  state.selfPlayer
  && state.turnPlayer !== state.selfPlayer.name
  && state.pendingAction
  && !state.pendingActionChallenge
  && !state.pendingBlock
  && state.pendingAction.pendingPlayers.includes(state.selfPlayer.name)

export const canPlayerChooseActionChallengeResponse = (state: PublicGameState) =>
  state.selfPlayer
  && state.turnPlayer === state.selfPlayer.name
  && state.pendingActionChallenge

export const canPlayerChooseBlockResponse = (state: PublicGameState) =>
  state.selfPlayer
  && state.pendingBlock
  && !state.pendingBlockChallenge
  && state.pendingBlock.sourcePlayer !== state.selfPlayer.name
  && state.pendingBlock.pendingPlayers.includes(state.selfPlayer.name)

export const canPlayerChooseBlockChallengeResponse = (state: PublicGameState) =>
  state.selfPlayer
  && state.pendingBlock
  && state.pendingBlockChallenge
  && state.pendingBlock.sourcePlayer === state.selfPlayer.name
