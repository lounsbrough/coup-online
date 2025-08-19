import { PlayerActions, DehydratedPublicGameState } from "@shared"
import { useMemo, useRef, useState, useEffect } from "react"
import { useWebSocketContext } from "../contexts/WebSocketContext"
import { useGameStateContext } from "../contexts/GameStateContext"
import useSWRMutation from "swr/mutation"
import { getBaseUrl } from "../helpers/api"
import { useNotificationsContext } from "../contexts/NotificationsContext"
import { useTranslationContext } from '../contexts/TranslationsContext'

function useGameMutation<ParamsType>({ action, callback }: {
  action: PlayerActions,
  callback?: (gameState: DehydratedPublicGameState) => void
}) {
  const noSocketCallbackTimeout = useRef<NodeJS.Timeout>(undefined)
  const [mutationError, setMutationError] = useState('')
  const [isMutatingSocket, setIsMutatingSocket] = useState(false)
  const { socket, isConnected } = useWebSocketContext()
  const { setDehydratedGameState } = useGameStateContext()
  const { showNotification } = useNotificationsContext()
  const { language } = useTranslationContext()

  const { trigger: triggerSwr, isMutating: isMutatingSwr } = useSWRMutation(`${getBaseUrl()}/${action}`, (async (url: string, { arg }: { arg: ParamsType }) => {
    setMutationError('')
    return fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...arg, language })
    }).then(async (res) => {
      if (res.ok) {
        const { gameState } = await res.json()
        setDehydratedGameState(gameState)
        callback?.(gameState)
      } else {
        setMutationError((await res.json()).error)
      }
    }).catch(() => {
      setMutationError('Unable to connect to server')
    })
  }))

  const trigger = useMemo(() => socket && isConnected
    ? (params: ParamsType) => {
      setMutationError('')
      setIsMutatingSocket(true)
      clearTimeout(noSocketCallbackTimeout.current)
      noSocketCallbackTimeout.current = setTimeout(() => {
        setIsMutatingSocket(false)
      }, 5000)
      socket.emit(
        action,
        { ...params, language },
        ({ error, gameState }: { error: string, gameState: DehydratedPublicGameState }) => {
          clearTimeout(noSocketCallbackTimeout.current)
          setIsMutatingSocket(false)
          if (error) {
            setMutationError(error)
          } else {
            callback?.(gameState)
            setDehydratedGameState(gameState)
          }
        })
    }
    : triggerSwr, [socket, isConnected, action, language, callback, triggerSwr, setDehydratedGameState])

  useEffect(() => {
    if (mutationError) {
      showNotification({
        id: mutationError,
        message: mutationError,
        severity: 'error'
      })
    }
  }, [mutationError, showNotification])

  return { trigger, isMutating: isMutatingSwr || isMutatingSocket }
}

export default useGameMutation
