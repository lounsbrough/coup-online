import { createContext, useContext, ReactNode, useMemo, useEffect, useState } from 'react'
import { io, Socket } from "socket.io-client"

const URL = 'http://localhost:8008'

type WebSocketContextType = { socket?: Socket, isConnected: boolean }

export const WebSocketContext = createContext<WebSocketContextType>({ isConnected: false })

export function WebSocketContextProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const socket = useMemo(() => io(URL), [])

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true)
    })
    socket.on('disconnect', async () => {
      setIsConnected(false)
      while (!socket.connected) {
        console.log('trying to reconnect to socket')
        socket.disconnect()
        socket.connect()
        await new Promise((resolve) => { setTimeout(resolve, 2000) })
      }
      setIsConnected(true)
    })
  }, [socket])

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocketContext = () => useContext(WebSocketContext)
