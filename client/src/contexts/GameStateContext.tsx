import { useState, createContext, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react'
import useSWR from 'swr'
import { PlayerActions, PublicGameState, DehydratedPublicGameState, ServerEvents, isSameState, rehydratePublicGameState } from '@shared'
import { getPlayerId } from '../helpers/players'
import { useSearchParams } from 'react-router'
import { useWebSocketContext } from './WebSocketContext'
import { getBaseUrl } from '../helpers/api'
import { useTranslationContext } from './TranslationsContext'

type GameStateContextType = {
  gameState?: PublicGameState | undefined,
  setDehydratedGameState: (newGameState: DehydratedPublicGameState) => void
  hasInitialStateLoaded: boolean
}

export const GameStateContext = createContext<GameStateContextType>({
  setDehydratedGameState: () => { },
  hasInitialStateLoaded: false
})

export function GameStateContextProvider({ children }: { children: ReactNode }) {
  const [hasInitialStateLoaded, setHasInitialStateLoaded] = useState(false)
  const [dehydratedGameState, setDehydratedGameState] = useState<DehydratedPublicGameState>()
  const [searchParams] = useSearchParams()
  const { socket, isConnected } = useWebSocketContext()
  const { language } = useTranslationContext()

  const roomId = searchParams.get('roomId')

  const gameState = useMemo(() =>
    dehydratedGameState ? rehydratePublicGameState(dehydratedGameState) : undefined,
    [dehydratedGameState]
  )

  const setDehydratedGameStateIfChanged = useCallback((newState: DehydratedPublicGameState) => {
    setDehydratedGameState((prevState) => prevState && isSameState(prevState, newState) ? prevState : newState)
  }, [setDehydratedGameState])

  const handleGameStateResponse = useCallback(async (response: Response) => {
    if (response.ok) {
      const { gameState: newState } = await response.json()
      setDehydratedGameStateIfChanged(newState)
    }
    setHasInitialStateLoaded(true)
  }, [setDehydratedGameStateIfChanged, setHasInitialStateLoaded])

  useSWR<void, Error>(
    roomId
      ? `${getBaseUrl()}/${PlayerActions.gameState}?roomId=${encodeURIComponent(roomId)}&playerId=${encodeURIComponent(getPlayerId())}&language=${encodeURIComponent(language)}`
      : null,
    async function (input: RequestInfo, init?: RequestInit) {
      try {
        const response = await fetch(input, init)
        handleGameStateResponse(response)
      } catch (error) {
        console.error(error)
      }
    },
    { refreshInterval: 2000, isPaused: () => !roomId || isConnected }
  )

  useEffect(() => {
    if (!roomId || !socket || !isConnected) {
      if (!roomId) setDehydratedGameState(undefined)
      return
    }

    socket.removeAllListeners(ServerEvents.gameStateChanged).on(ServerEvents.gameStateChanged, (dehydratedGameState) => {
      setDehydratedGameStateIfChanged(dehydratedGameState)
      setHasInitialStateLoaded(true)
    })
    socket.removeAllListeners(ServerEvents.error).on(ServerEvents.error, (error) => {
      console.error(error)
      setHasInitialStateLoaded(true)
    })
    socket.emit(PlayerActions.gameState, { roomId, playerId: getPlayerId(), language })

    const intervalId = setInterval(() => {
      socket.emit(PlayerActions.gameState, { roomId, playerId: getPlayerId(), language })
    }, 5000)

    return () => { clearInterval(intervalId) }
  }, [roomId, socket, language, isConnected, setDehydratedGameStateIfChanged])

  const playersLeft = gameState?.players.filter(({ influenceCount }) => influenceCount)
  const gameIsOver = playersLeft?.length === 1
  const aiPlayersActive = gameState?.isStarted && !gameIsOver && gameState?.players.some(({ ai, influenceCount }) =>
    ai && influenceCount)

  useEffect(() => {
    if (!roomId || !aiPlayersActive) {
      return
    }

    const interval = setInterval(() => {
      if (socket && isConnected) {
        socket.emit(PlayerActions.checkAiMove, { roomId, playerId: getPlayerId(), language })
      } else {
        fetch(`${getBaseUrl()}/${PlayerActions.checkAiMove}?roomId=${encodeURIComponent(roomId)}&playerId=${encodeURIComponent(getPlayerId())}`)
          .then(handleGameStateResponse)
          .catch((error) => {
            console.error(error)
          })
      }
    }, isConnected ? 1000 : 2000)

    return () => {
      clearInterval(interval)
    }
  }, [roomId, socket, isConnected, language, aiPlayersActive, handleGameStateResponse])

  const contextValue = { gameState, setDehydratedGameState, hasInitialStateLoaded }

  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  )
}

export const useGameStateContext = () => useContext(GameStateContext)
