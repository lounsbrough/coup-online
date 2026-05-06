
import React, { useMemo } from "react"
import { vi } from "vitest"
import { screen, render as testingLibraryRender } from "@testing-library/react"
import { PaletteMode } from "@mui/material"
import Chance from 'chance'
import { GameStateContext } from "../../src/contexts/GameStateContext"
import { MAX_PLAYER_COUNT, PublicGameState, PublicPlayer } from '@shared'
import { useColorModeContext } from "../../src/contexts/MaterialThemeContext"
import MaterialThemeContextProvider from "../../src/contexts/MaterialThemeContextProvider"

vi.mock("../../src/contexts/WebSocketContext", () => ({ useWebSocketContext: () => ({}) }))

const chance = new Chance()

export const getRandomGameState = (): PublicGameState => {
  const players: PublicPlayer[] = chance.n(() => ({
    name: chance.string(),
    coins: chance.natural({ min: 0, max: 12 }),
    influenceCount: chance.natural({ min: 0, max: 2 }),
    color: chance.color(),
    claimedInfluences: new Set(),
    unclaimedInfluences: new Set(),
    deadInfluences: [],
    ai: false,
    grudges: {},
  }), chance.natural({ min: 2, max: MAX_PLAYER_COUNT }))

  const selfPlayer = chance.pickone(players)

  return {
    players: players,
    roomId: chance.string(),
    eventLogs: [],
    chatMessages: [],
    lastEventTimestamp: new Date(),
    turn: 1,
    settings: { eventLogRetentionTurns: 3, allowRevive: false },
    isStarted: true,
    pendingInfluenceLoss: {},
    turnPlayer: chance.string(),
    deckCount: chance.natural({ min: 0, max: 15 }),
    selfPlayer: {
      coins: selfPlayer.coins,
      color: selfPlayer.color,
      id: chance.string(),
      influences: [],
      name: selfPlayer.name,
      claimedInfluences: new Set(),
      unclaimedInfluences: new Set(),
      deadInfluences: [],
      ai: false,
      grudges: {}
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

    const resolvedGameState = useMemo(
      () => gameState ?? getRandomGameState(),
      [gameState]
    )

    const contextValue = useMemo(() => ({
      gameState: resolvedGameState,
      setDehydratedGameState: () => { },
      hasInitialStateLoaded: true,
      serverTimeOffset: 0,
    }), [resolvedGameState])

    return (
      <GameStateContext.Provider value={contextValue}>
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
