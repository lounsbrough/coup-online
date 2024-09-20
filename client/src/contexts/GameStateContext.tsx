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
  const [gameState, setGameState] = useState<PublicGameState>()
  const [searchParams] = useSearchParams()
  const { socket } = useWebSocketContext()

  const roomId = searchParams.get('roomId')

  const { error } = useSWR<void, Error>(
    roomId
      ? `${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8008'}/gameState?roomId=${encodeURIComponent(roomId)}&playerId=${encodeURIComponent(getPlayerId())}`
      : null,
    async function (input: RequestInfo, init?: RequestInit) {
      const res = await fetch(input, init)

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Game not found, please return home')
        } else {
          throw new Error('Unknown error fetching game state')
        }
      }

      const newState = await res.json()

      if (JSON.stringify(newState) !== JSON.stringify(gameState)) {
        setGameState(newState)
      }
    },
    { refreshInterval: 2000, isPaused: () => socket.connected }
  )

  useEffect(() => {
    if (socket.connected) {
      socket.removeAllListeners('gameStateChanged').on('gameStateChanged', (gameState) => {
        setGameState(gameState)
      })
      socket.emit('gameState', {
        roomId,
        playerId: getPlayerId()
      })
    }
  }, [roomId, socket, socket.connected])

  const contextValue = { gameState, setGameState }

  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
      {!!error && <Typography color='error' sx={{ m: 5 }}>{error.message}</Typography>}
    </GameStateContext.Provider>
  )
}

export const useGameStateContext = () => useContext(GameStateContext)
