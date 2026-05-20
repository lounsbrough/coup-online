import { ActionAttributes, Actions, GameState, Influences, TimelineEntry } from '../../../shared/types/game'

export const recordTimelineAction = (
  state: GameState,
  playerName: string,
  action: Actions,
  targetPlayer?: string,
): void => {
  const claimedInfluence = ActionAttributes[action].influenceRequired
  if (!claimedInfluence) return

  const player = state.players.find(({ name }) => name === playerName)
  if (!player) return

  const isBluff = !player.influences.includes(claimedInfluence)

  const entry: TimelineEntry = {
    turn: state.turn,
    player: playerName,
    action,
    claimedInfluence,
    actualHand: [...player.influences],
    isBluff,
    outcome: 'unchallenged',
    ...(targetPlayer && { targetPlayer }),
  }

  state.gameTimeline.push(entry)
}

export const recordTimelineBlock = (
  state: GameState,
  blockerName: string,
  claimedInfluence: Influences,
): void => {
  const blocker = state.players.find(({ name }) => name === blockerName)
  if (!blocker) return

  let lastEntry = getLastTimelineEntry(state)

  // If no timeline entry exists (e.g. Foreign Aid has no influence claim),
  // create one so the block is captured
  if (!lastEntry || lastEntry.turn !== state.turn || lastEntry.player !== state.turnPlayer) {
    const entry: TimelineEntry = {
      turn: state.turn,
      player: state.turnPlayer!,
      action: state.pendingAction!.action,
      actualHand: [],
      isBluff: false,
      outcome: 'blocked',
      ...(state.pendingAction!.targetPlayer && { targetPlayer: state.pendingAction!.targetPlayer }),
    }
    state.gameTimeline.push(entry)
    lastEntry = entry
  }

  lastEntry.blockedBy = blockerName
  lastEntry.blockClaimedInfluence = claimedInfluence
  lastEntry.blockIsBluff = !blocker.influences.includes(claimedInfluence)
  lastEntry.outcome = 'blocked'
}

export const recordTimelineActionChallenge = (
  state: GameState,
  challengerName: string,
  succeeded: boolean,
): void => {
  const lastEntry = getLastTimelineEntry(state)
  if (!lastEntry) return

  lastEntry.challengedBy = challengerName
  lastEntry.outcome = succeeded ? 'challenge_succeeded' : 'challenge_failed'
}

export const recordTimelineBlockChallenge = (
  state: GameState,
  challengerName: string,
  succeeded: boolean,
): void => {
  const lastEntry = getLastTimelineEntry(state)
  if (!lastEntry) return

  lastEntry.blockChallengedBy = challengerName
  lastEntry.outcome = succeeded ? 'block_challenged_succeeded' : 'block_challenged_failed'
}

const getLastTimelineEntry = (state: GameState): TimelineEntry | undefined =>
  state.gameTimeline[state.gameTimeline.length - 1]
