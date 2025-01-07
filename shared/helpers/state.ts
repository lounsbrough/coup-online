import { GameState, PublicGameState } from "../types/game";

const arraySortReplacer = (_: string, value: any) => (value instanceof Array ? [...value].sort() : value)

export const isSameState = (a: GameState | PublicGameState, b: GameState | PublicGameState) =>
  JSON.stringify(a, arraySortReplacer) === JSON.stringify(b, arraySortReplacer)
