import { GameState, PublicGameState, DehydratedGameState, DehydratedPublicGameState, ChatMessage, DehydratedChatMessage } from "../types/game";

const arraySortReplacer = (_: string, value: any) => (value instanceof Array ? [...value].sort() : value)

export const isSameState = (a: DehydratedGameState | DehydratedPublicGameState, b: DehydratedGameState | DehydratedPublicGameState) =>
  JSON.stringify(a, arraySortReplacer) === JSON.stringify(b, arraySortReplacer)

const getRequiredChatMessageFields = <T extends ChatMessage | DehydratedChatMessage>(chatMessage: T): Omit<T, 'emojis'> => {
  const required = {...chatMessage}
  delete required.emojis
  return required
}

const dehydrateCommonGameState = (hydrated: GameState | PublicGameState) => ({
  eventLogs: hydrated.eventLogs,
  isStarted: hydrated.isStarted,
  roomId: hydrated.roomId,
  turn: hydrated.turn,
  lastEventTimestamp: hydrated.lastEventTimestamp.toISOString(),
  chatMessages: hydrated.chatMessages.map((message) => ({
    ...getRequiredChatMessageFields(message),
    timestamp: message.timestamp.toISOString(),
    ...(message.emojis && {
      emojis: Object.fromEntries(
        Object.entries(message.emojis).map(([emoji, playerNames]) => ([emoji, [...playerNames]]))
      )
    }),
  })),
  ...(hydrated.pendingAction && {
    pendingAction: {
      ...hydrated.pendingAction,
      pendingPlayers: [...hydrated.pendingAction.pendingPlayers]
    }
  }),
  ...(hydrated.pendingActionChallenge && {
    pendingActionChallenge: hydrated.pendingActionChallenge
  }),
  ...(hydrated.pendingBlock && {
    pendingBlock: {
      ...hydrated.pendingBlock,
      pendingPlayers: [...hydrated.pendingBlock.pendingPlayers]
    }
  }),
  ...(hydrated.pendingBlockChallenge && {
    pendingBlockChallenge: hydrated.pendingBlockChallenge
  }),
  ...(hydrated.pendingInfluenceLoss && {
    pendingInfluenceLoss: hydrated.pendingInfluenceLoss
  }),
  ...(hydrated.resetGameRequest && {
    resetGameRequest: hydrated.resetGameRequest
  }),
  ...(hydrated.turnPlayer && {
    turnPlayer: hydrated.turnPlayer
  }),
})

export const dehydrateGameState = (hydrated: GameState) : DehydratedGameState => ({
  ...dehydrateCommonGameState(hydrated),
  deck: hydrated.deck,
  settings: hydrated.settings,
  availablePlayerColors: hydrated.availablePlayerColors,
  players: hydrated.players.map((player) => ({
    ...player,
    claimedInfluences: [...player.claimedInfluences],
    unclaimedInfluences: [...player.unclaimedInfluences]
  })),
})

export const dehydratePublicGameState = (hydrated: PublicGameState) : DehydratedPublicGameState => ({
  ...dehydrateCommonGameState(hydrated),
  deckCount: hydrated.deckCount,
  players: hydrated.players.map((player) => ({
    ...player,
    claimedInfluences: [...player.claimedInfluences],
    unclaimedInfluences: [...player.unclaimedInfluences]
  })),
  ...(hydrated.selfPlayer && {
    selfPlayer: {
      ...hydrated.selfPlayer,
      claimedInfluences: [...hydrated.selfPlayer.claimedInfluences],
      unclaimedInfluences: [...hydrated.selfPlayer.unclaimedInfluences]
    }
  }),
})

const rehydrateCommonGameState = (dehydrated: DehydratedGameState | DehydratedPublicGameState) => ({
  eventLogs: dehydrated.eventLogs,
  isStarted: dehydrated.isStarted,
  roomId: dehydrated.roomId,
  turn: dehydrated.turn,
  lastEventTimestamp: new Date(dehydrated.lastEventTimestamp),
  chatMessages: dehydrated.chatMessages.map((message) => ({
    ...getRequiredChatMessageFields(message),
    timestamp: new Date(message.timestamp),
    ...(message.emojis && {
      emojis: Object.fromEntries(
        Object.entries(message.emojis).map(([emoji, playerNames]) => ([emoji, new Set(playerNames)]))
      )
    }),
  })),
  ...(dehydrated.pendingAction && {
    pendingAction: {
      ...dehydrated.pendingAction,
      pendingPlayers: new Set(dehydrated.pendingAction.pendingPlayers)
    }
  }),
  ...(dehydrated.pendingActionChallenge && {
    pendingActionChallenge: dehydrated.pendingActionChallenge
  }),
  ...(dehydrated.pendingBlock && {
    pendingBlock: {
      ...dehydrated.pendingBlock,
      pendingPlayers: new Set(dehydrated.pendingBlock.pendingPlayers)
    }
  }),
  ...(dehydrated.pendingBlockChallenge && {
    pendingBlockChallenge: dehydrated.pendingBlockChallenge
  }),
  ...(dehydrated.pendingInfluenceLoss && {
    pendingInfluenceLoss: dehydrated.pendingInfluenceLoss
  }),
  ...(dehydrated.resetGameRequest && {
    resetGameRequest: dehydrated.resetGameRequest
  }),
  ...(dehydrated.turnPlayer && {
    turnPlayer: dehydrated.turnPlayer
  }),
})

export const rehydrateGameState = (dehydrated: DehydratedGameState): GameState => {
  return ({
    ...rehydrateCommonGameState(dehydrated),
    deck: dehydrated.deck,
    settings: dehydrated.settings,
    availablePlayerColors: dehydrated.availablePlayerColors,
    players: dehydrated.players.map((player) => ({
      ...player,
      claimedInfluences: new Set(player.claimedInfluences),
      unclaimedInfluences: new Set(player.unclaimedInfluences),
    })),
  });
}

export const rehydratePublicGameState = (dehydrated: DehydratedPublicGameState): PublicGameState => ({
  ...rehydrateCommonGameState(dehydrated),
  deckCount: dehydrated.deckCount,
  players: dehydrated.players.map((player) => ({
    ...player,
    claimedInfluences: new Set(player.claimedInfluences),
    unclaimedInfluences: new Set(player.unclaimedInfluences),
  })),
  ...(dehydrated.selfPlayer && {
    selfPlayer: {
      ...dehydrated.selfPlayer,
      claimedInfluences: new Set(dehydrated.selfPlayer.claimedInfluences),
      unclaimedInfluences: new Set(dehydrated.selfPlayer.unclaimedInfluences)
    }
  }),
})
