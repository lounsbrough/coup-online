import { useState, ReactNode, useEffect, useCallback, useMemo } from 'react'
import useSWR from 'swr'
import { PlayerActions, DehydratedPublicGameState, ServerEvents, isSameState, rehydratePublicGameState } from '@shared'
import { getPlayerId } from '../helpers/players'
import { useSearchParams } from 'react-router'
import { useWebSocketContext } from './WebSocketContext'
import { getBaseUrl } from '../helpers/api'
import { useTranslationContext } from './TranslationsContext'
import { GameStateContext } from './GameStateContext'

function GameStateContextProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [hasInitialStateLoaded, setHasInitialStateLoaded] = useState(false)
  const [dehydratedGameState, setDehydratedGameState] = useState<DehydratedPublicGameState>()
  const [serverTimeOffset, setServerTimeOffset] = useState(0)
  const [searchParams] = useSearchParams()
  const { socket, isConnected } = useWebSocketContext()
  const { language } = useTranslationContext()

  const roomId = searchParams.get('roomId')

  const gameState = useMemo(() =>
    dehydratedGameState ? rehydratePublicGameState(dehydratedGameState) : undefined,
    [dehydratedGameState]
  )

  const updateServerTimeOffset = useCallback((serverTime?: string) => {
    if (serverTime) {
      const serverNow = new Date(serverTime).getTime()
      const clientNow = Date.now()
      setServerTimeOffset(serverNow - clientNow)
    }
  }, [])

  const setDehydratedGameStateIfChanged = useCallback((newState: DehydratedPublicGameState, serverTime?: string) => {
    updateServerTimeOffset(serverTime)
    setDehydratedGameState((prevState) => prevState && isSameState(prevState, newState) ? prevState : newState)
  }, [setDehydratedGameState, updateServerTimeOffset])

  const handleGameStateResponse = useCallback(async (response: Response) => {
    if (response.ok) {
      const { gameState: newState, serverTime } = await response.json()
      setDehydratedGameStateIfChanged(newState, serverTime)
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

    socket.removeAllListeners(ServerEvents.gameStateChanged).on(ServerEvents.gameStateChanged, ({ gameState: nextState, serverTime }: { gameState: DehydratedPublicGameState, serverTime: string }) => {
      setDehydratedGameStateIfChanged(nextState, serverTime)
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
  const speedRoundActive = gameState?.settings.speedRoundSeconds
  const autoMovePlayersActive = gameState?.isStarted && !gameIsOver && (speedRoundActive || gameState?.players.some(({ ai, influenceCount }) =>
    ai && influenceCount))

  useEffect(() => {
    if (!roomId || !autoMovePlayersActive) {
      return
    }

    const interval = setInterval(() => {
      if (socket && isConnected) {
        socket.emit(PlayerActions.checkAutoMove, { roomId, playerId: getPlayerId(), language }, ({ gameState: newGameState, serverTime }: { gameState?: DehydratedPublicGameState, serverTime?: string }) => {
          if (newGameState) {
            setDehydratedGameStateIfChanged(newGameState, serverTime)
          }
        })
      } else {
        fetch(`${getBaseUrl()}/${PlayerActions.checkAutoMove}?roomId=${encodeURIComponent(roomId)}&playerId=${encodeURIComponent(getPlayerId())}&language=${encodeURIComponent(language)}`)
          .then(handleGameStateResponse)
          .catch((error) => {
            console.error(error)
          })
      }
    }, isConnected ? 500 : 1000)

    return () => {
      clearInterval(interval)
    }
  }, [roomId, socket, isConnected, language, autoMovePlayersActive, handleGameStateResponse, setDehydratedGameStateIfChanged])

  const contextValue = useMemo(() => ({
    gameState,
    setDehydratedGameState,
    hasInitialStateLoaded,
    serverTimeOffset
  }), [gameState, setDehydratedGameState, hasInitialStateLoaded, serverTimeOffset])

  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  )
}
export default GameStateContextProvider
