import {
  ReactNode,
  useMemo,
  useEffect,
  useState,
} from 'react'
import { io } from 'socket.io-client'
import { WebSocketContext } from './WebSocketContext'

const socketUrl =
  import.meta.env.VITE_SOCKET_SERVER_URL ?? 'http://localhost:8008'
const socketPath = import.meta.env.VITE_SOCKET_SERVER_PATH ?? ''

function WebSocketContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const socket = useMemo(() => io(socketUrl, { path: socketPath }), [])

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
        await new Promise((resolve) => {
          setTimeout(resolve, 2000)
        })
      }
      setIsConnected(true)
    })
  }, [socket])

  useEffect(() => {
    console.log(`socket connected: ${isConnected}`)
  }, [isConnected])

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export default WebSocketContextProvider
