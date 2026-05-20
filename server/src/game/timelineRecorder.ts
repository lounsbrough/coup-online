import { ActionAttributes, Actions, GameState, Influences, TimelineEntry } from '../../../shared/types/game'

export const recordTimelineAction = (
  state: GameState,
  playerName: string,
  action: Actions,
  targetPlayer?: string,
): void => {
  const player = state.players.find(({ name }) => name === playerName)
  if (!player) return

  const claimedInfluence = ActionAttributes[action].influenceRequired
  const isBluff = claimedInfluence ? !player.influences.includes(claimedInfluence) : false

  const entry: TimelineEntry = {
    turn: state.turn,
    player: playerName,
    action,
    ...(claimedInfluence && { claimedInfluence }),
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
  const lastEntry = getLastTimelineEntry(state)
  if (!lastEntry) return

  const blocker = state.players.find(({ name }) => name === blockerName)
  if (!blocker) return

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
