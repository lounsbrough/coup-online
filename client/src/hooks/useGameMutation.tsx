import { PlayerActions, PublicGameState } from "@shared"
import { useMemo, useState } from "react"
import { useWebSocketContext } from "../contexts/WebSocketContext"
import { useGameStateContext } from "../contexts/GameStateContext"
import useSWRMutation from "swr/mutation"
import { getBaseUrl } from "../helpers/api"

function useGameMutation<ParamsType>({ action, callback }: {
  action: PlayerActions,
  callback?: (gameState: PublicGameState) => void
}) {
  const [error, setError] = useState('')
  const { socket, isConnected } = useWebSocketContext()
  const { setGameState } = useGameStateContext()

  const { trigger: triggerSwr, isMutating } = useSWRMutation(`${getBaseUrl()}/${action}`, (async (url: string, { arg }: { arg: ParamsType }) => {
    setError('')
    return fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(arg)
    }).then(async (res) => {
      if (res.ok) {
        const { gameState } = await res.json()
        setGameState(gameState)
        callback?.(gameState)
      } else {
        setError((await res.json()).error)
      }
    })
  }))

  const trigger = useMemo(() => socket && isConnected
    ? (params: ParamsType) => {
      setError('')
      socket.emit(action, params, ({ error, gameState }: { error: string, gameState: PublicGameState }) => {
        if (error) {
          setError(error)
        } else {
          callback?.(gameState)
          setGameState(gameState)
        }
      })
    }
    : triggerSwr, [socket, isConnected, action, callback, triggerSwr, setGameState])

  return { trigger, error, isMutating }
}

export default useGameMutation
