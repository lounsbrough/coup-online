
import React from "react"
import { vi } from "vitest"
import { screen, render as testingLibraryRender } from "@testing-library/react"
import Chance from 'chance'
import { GameStateContext } from "../../src/contexts/GameStateContext"
import { MAX_PLAYER_COUNT, PublicGameState } from '@shared'
import { MaterialThemeContextProvider, useColorModeContext } from "../../src/contexts/MaterialThemeContext"
import { PaletteMode } from "@mui/material"

vi.mock("../../src/contexts/WebSocketContext", () => ({ useWebSocketContext: () => ({}) }))

const chance = new Chance()

export const getRandomGameState = (): PublicGameState => {
  const players = chance.n(() => ({
    name: chance.string(),
    coins: chance.natural({ min: 0, max: 12 }),
    influenceCount: chance.natural({ min: 0, max: 2 }),
    color: chance.color()
  }), chance.natural({ min: 2, max: MAX_PLAYER_COUNT }))

  const selfPlayer = chance.pickone(players)

  return {
    players: players,
    roomId: chance.string(),
    eventLogs: [],
    isStarted: true,
    pendingInfluenceLoss: {},
    pendingAction: undefined,
    pendingActionChallenge: undefined,
    pendingBlock: undefined,
    pendingBlockChallenge: undefined,
    turnPlayer: chance.string(),
    selfPlayer: {
      coins: selfPlayer.coins,
      color: selfPlayer.color,
      id: chance.string(),
      influences: [],
      name: selfPlayer.name
    }
  }
}

export const render = (jsx: React.JSX.Element, {
  gameState
}: {
  gameState?: PublicGameState
} = {}) => {
  const TestComponent = () => {
    const { colorMode } = useColorModeContext()

    return (
      <GameStateContext.Provider value={{
        gameState: gameState ?? getRandomGameState(),
        setGameState: () => { },
      }}>
        <>
          <span data-testid="current-color-mode">{colorMode}</span>
          {jsx}
        </>
      </GameStateContext.Provider>
    )
  }

  return testingLibraryRender(
    <MaterialThemeContextProvider>
      <TestComponent />
    </MaterialThemeContextProvider>)
}

export const getCurrentColorMode = async () => {
  return (await screen.findByTestId('current-color-mode')).textContent! as PaletteMode
}
