import { GameState, PublicGameState, DehydratedGameState, DehydratedPublicGameState } from "../types/game";

const arraySortReplacer = (_: string, value: any) => (value instanceof Array ? [...value].sort() : value)

export const isSameState = (a: DehydratedGameState | DehydratedPublicGameState, b: DehydratedGameState | DehydratedPublicGameState) =>
  JSON.stringify(a, arraySortReplacer) === JSON.stringify(b, arraySortReplacer)

export const dehydrateGameState = <T extends GameState | PublicGameState>(gameState: T) : T extends GameState ? DehydratedGameState : DehydratedPublicGameState => {
  return {
    ...gameState,
    lastEventTimestamp: gameState.lastEventTimestamp.toISOString(),
    chatMessages: gameState.chatMessages.map((message) => ({
      ...message,
      timestamp: message.timestamp.toISOString()
    }))
  } as unknown as (T extends GameState ? DehydratedGameState : DehydratedPublicGameState);
}

export const rehydrateGameState = <T extends DehydratedGameState | DehydratedPublicGameState>(dehydratedGameState: T): T extends DehydratedGameState ? GameState : PublicGameState => {
  return {
    ...dehydratedGameState,
    lastEventTimestamp: new Date(dehydratedGameState.lastEventTimestamp),
    chatMessages: dehydratedGameState.chatMessages.map((message) => ({
      ...message,
      timestamp: new Date(message.timestamp)
    }))
  } as unknown as (T extends DehydratedGameState ? GameState : PublicGameState);
}
