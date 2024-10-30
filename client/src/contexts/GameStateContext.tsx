import { useState, createContext, useContext, ReactNode, useEffect } from 'react'
import useSWR from 'swr'
import { PlayerActions, PublicGameState, ServerEvents } from '@shared'
import { getPlayerId } from '../helpers/players'
import { Typography } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import { useWebSocketContext } from './WebSocketContext'
import { getBaseUrl } from '../helpers/api'

type GameStateContextType = {
  gameState?: PublicGameState | undefined,
  setGameState: (newGameState: PublicGameState) => void
}

export const GameStateContext = createContext<GameStateContextType>({
  setGameState: () => { }
})

export function GameStateContextProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState('')
  const [gameState, setGameState] = useState<PublicGameState>()
  const [searchParams] = useSearchParams()
  const { socket, isConnected } = useWebSocketContext()

  const roomId = searchParams.get('roomId')

  useSWR<void, Error>(
    roomId
      ? `${getBaseUrl()}/${PlayerActions.gameState}?roomId=${encodeURIComponent(roomId)}&playerId=${encodeURIComponent(getPlayerId())}`
      : null,
    async function (input: RequestInfo, init?: RequestInit) {
      try {
        const res = await fetch(input, init)

        if (res.ok) {
          setError('')
          const { gameState: newState } = await res.json()

          if (JSON.stringify(newState) !== JSON.stringify(gameState)) {
            setGameState(newState)
          }
        } else {
          setError((await res.json()).error)
        }
      } catch (error) {
        console.error(error)
        setError('Unexpected error processing request')
      }
    },
    { refreshInterval: 2000, isPaused: () => socket?.connected ?? false }
  )

  useEffect(() => {
    console.log(`socket connected: ${isConnected}`)
    if (socket && isConnected) {
      setError('')
      socket.removeAllListeners(ServerEvents.error).on(ServerEvents.error, (error) => { setError(error) })
      socket.removeAllListeners(ServerEvents.gameStateChanged).on(ServerEvents.gameStateChanged, (gameState) => {
        setError('')
        setGameState(gameState)
      })
      socket.emit(PlayerActions.gameState, { roomId, playerId: getPlayerId() })
    }
  }, [roomId, socket, isConnected])

  const contextValue = { gameState, setGameState }

  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
      {!!error && <Typography color='error' sx={{ m: 5 }}>{error}</Typography>}
    </GameStateContext.Provider>
  )
}

export const useGameStateContext = () => useContext(GameStateContext)
