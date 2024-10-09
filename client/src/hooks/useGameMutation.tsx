import { PlayerActions, PublicGameState, ServerEvents } from "@shared"
import { useMemo, useState } from "react"
import { useWebSocketContext } from "../contexts/WebSocketContext"
import { useGameStateContext } from "../contexts/GameStateContext"
import useSWRMutation from "swr/mutation"

function useGameMutation<ParamsType>({ action, callback }: {
  action: PlayerActions,
  callback?: (gameState: PublicGameState) => void
}) {
  const [error, setError] = useState('')
  const { socket } = useWebSocketContext()
  const { setGameState } = useGameStateContext()

  const { trigger: triggerSwr, isMutating } = useSWRMutation(`${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8008'}/${action}`, (async (url: string, { arg }: { arg: ParamsType }) => {
    return fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(arg)
    }).then(async (res) => {
      if (res.ok) {
        const gameState = await res.json()
        setGameState(gameState)
        callback?.(gameState)
      } else {
        if (res.status === 404) {
          setError('Not found')
        } else if (res.status === 400) {
          setError(await res.text())
        } else {
          setError('Error updating game state')
        }
      }
    })
  }))

  const trigger = useMemo(() => socket?.connected
    ? (params: ParamsType) => {
      socket.removeAllListeners(ServerEvents.error).on(ServerEvents.error, (error) => { setError(error) })
      if (callback) {
        socket.removeAllListeners(ServerEvents.gameStateChanged).on(ServerEvents.gameStateChanged, (gameState) => {
          callback(gameState)
        })
      }
      socket.emit(action, params)
    }
    : triggerSwr, [socket, action, callback, triggerSwr])

  return { trigger, error, isMutating }
}

export default useGameMutation
