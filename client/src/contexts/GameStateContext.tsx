import { useState, createContext, useContext, ReactNode, useEffect } from 'react'
import useSWR from 'swr'
import { PublicGameState } from '@shared'
import { getPlayerId } from '../helpers/playerId'
import { Typography } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import { useWebSocketContext } from './WebSocketContext'

type GameStateContextType = {
  gameState?: PublicGameState,
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
      ? `${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8008'}/gameState?roomId=${encodeURIComponent(roomId)}&playerId=${encodeURIComponent(getPlayerId())}`
      : null,
    async function (input: RequestInfo, init?: RequestInit) {
      try {
        const res = await fetch(input, init)

        if (res.ok) {
          setError('')
          const newState = await res.json()

          if (JSON.stringify(newState) !== JSON.stringify(gameState)) {
            setGameState(newState)
          }
        } else {
          if (res.status === 404) {
            setError('Game not found, please return home')
          } else if (res.status === 400) {
            setError((await res.json() as { error: string }).error)
          }
        }
      } catch (error) {
        console.error(error)
        setError('Unexpected error loading game state')
      }
    },
    { refreshInterval: 2000, isPaused: () => socket?.connected ?? false }
  )

  useEffect(() => {
    console.log(`socket connected: ${isConnected}`)
    if (socket && isConnected) {
      setError('')
      socket.on('error', (error) => { setError(error) })
      socket.removeAllListeners('gameStateChanged').on('gameStateChanged', (gameState) => {
        setError('')
        setGameState(gameState)
      })
      socket.emit('gameState', { roomId, playerId: getPlayerId() })
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
