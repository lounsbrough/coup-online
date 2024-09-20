import { createContext, useContext, ReactNode } from 'react'
import { io, Socket } from "socket.io-client"

const URL = 'http://localhost:8008'

type WebSocketContextType = { socket: Socket }

const socket = io(URL)

export const WebSocketContext = createContext<WebSocketContextType>({ socket })

export function WebSocketContextProvider({ children }: { children: ReactNode }) {
  return (
    <WebSocketContext.Provider value={{ socket }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocketContext = () => useContext(WebSocketContext)
