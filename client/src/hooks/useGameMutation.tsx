import { PlayerActions, DehydratedPublicGameState } from "@shared"
import { useMemo, useState } from "react"
import { useWebSocketContext } from "../contexts/WebSocketContext"
import { useGameStateContext } from "../contexts/GameStateContext"
import useSWRMutation from "swr/mutation"
import { getBaseUrl } from "../helpers/api"

function useGameMutation<ParamsType>({ action, callback }: {
  action: PlayerActions,
  callback?: (gameState: DehydratedPublicGameState) => void
}) {
  const [error, setError] = useState('')
  const [isMutatingSocket, setIsMutatingSocket] = useState(false)
  const { socket, isConnected } = useWebSocketContext()
  const { setDehydratedGameState } = useGameStateContext()

  const { trigger: triggerSwr, isMutating: isMutatingSwr } = useSWRMutation(`${getBaseUrl()}/${action}`, (async (url: string, { arg }: { arg: ParamsType }) => {
    setError('')
    return fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(arg)
    }).then(async (res) => {
      if (res.ok) {
        const { gameState } = await res.json()
        setDehydratedGameState(gameState)
        callback?.(gameState)
      } else {
        setError((await res.json()).error)
      }
    })
  }))

  const trigger = useMemo(() => socket && isConnected
    ? (params: ParamsType) => {
      setError('')
      setIsMutatingSocket(true)
      socket.emit(action, params, ({ error, gameState }: { error: string, gameState: DehydratedPublicGameState }) => {
        setIsMutatingSocket(false)
        if (error) {
          setError(error)
        } else {
          callback?.(gameState)
          setDehydratedGameState(gameState)
        }
      })
    }
    : triggerSwr, [socket, isConnected, action, callback, triggerSwr, setDehydratedGameState])

  return { trigger, error, isMutating: isMutatingSwr || isMutatingSocket }
}

export default useGameMutation
