import { createContext, useContext } from 'react'
import { PublicGameState, DehydratedPublicGameState } from '@shared'

type GameStateContextType = {
  gameState?: PublicGameState | undefined,
  setDehydratedGameState: (newGameState: DehydratedPublicGameState) => void
  hasInitialStateLoaded: boolean
  serverTimeOffset: number
}

export const GameStateContext = createContext<GameStateContextType>({
  setDehydratedGameState: () => { },
  hasInitialStateLoaded: false,
  serverTimeOffset: 0
})

export const useGameStateContext = () => useContext(GameStateContext)
