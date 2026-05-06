import {
  createContext,
  useContext,
} from 'react'
import { Socket } from 'socket.io-client'

type WebSocketContextType = { socket?: Socket; isConnected: boolean };

export const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
})

export const useWebSocketContext = () => useContext(WebSocketContext)
