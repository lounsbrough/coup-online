import { useState, useEffect, useRef } from 'react'
import Button from '@mui/material/Button'
import ChatMessages from './ChatMessages'
import { useTranslationContext } from '../../contexts/TranslationsContext'
import { Send } from '@mui/icons-material'
import { Box, TextField } from '@mui/material'
import useGameMutation from '../../hooks/useGameMutation'
import { PlayerActions } from '@shared'
import { getPlayerId } from '../../helpers/players'
import { useGameStateContext } from '../../contexts/GameStateContext'
import { getLatestReadMessageIdStorageKey } from '../../helpers/localStorageKeys'

interface ChatDrawerContentProps {
  chatOpen: boolean
  setLatestReadMessageId: (id: string) => void
}

export default function ChatDrawerContent({
  chatOpen, setLatestReadMessageId
}: ChatDrawerContentProps) {
  const scrollingMessageDrawerRef = useRef<HTMLElement>(null)
  const [pendingMessageText, setPendingMessageText] = useState('')
  const [pendingMessageId, setPendingMessageId] = useState('')
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  const { trigger, isMutating } = useGameMutation<{
    roomId: string, playerId: string, messageId: string, messageText: string
  }>({
    action: PlayerActions.sendChatMessage,
    callback: () => {
      setPendingMessageText('')
      setPendingMessageId('')
    }
  })

  const maxMessageLength = 500

  const sendEnabled = !!pendingMessageText.trim() && !!pendingMessageId

  useEffect(() => {
    if (!chatOpen || !gameState) return

    const latestMessageId = gameState.chatMessages.at(-1)?.id
    if (latestMessageId) {
      setLatestReadMessageId(latestMessageId)
      localStorage.setItem(getLatestReadMessageIdStorageKey(gameState.roomId), latestMessageId)
    }

    scrollingMessageDrawerRef.current?.scrollTo({
      top: scrollingMessageDrawerRef.current.scrollHeight,
      behavior: "smooth"
    })
  }, [chatOpen, gameState?.roomId, gameState?.chatMessages.length])

  if (!gameState) {
    return null
  }

  const sendMessage = () => {
    if (!isMutating) {
      trigger({
        roomId: gameState.roomId,
        playerId: getPlayerId(),
        messageId: pendingMessageId,
        messageText: pendingMessageText.trim()
      })
    }
  }

  return (
    <>
      <Box ref={scrollingMessageDrawerRef} sx={{ py: 1, px: 2, overflowY: 'auto', minWidth: '200px' }}>
        <ChatMessages />
      </Box>
      {!!gameState.selfPlayer && (
        <Box display="flex" p={1}>
          <TextField
            placeholder={t('writeNewMessage') as string}
            label={`${pendingMessageText ? ` (${maxMessageLength - pendingMessageText.length}/${maxMessageLength})` : ''}`}
            value={pendingMessageText}
            onChange={(event) => {
              setPendingMessageText(event.target.value)
              setPendingMessageId(crypto.randomUUID())
            }}
            onKeyDown={(event) => {
              if (sendEnabled && event.key === 'Enter') {
                sendMessage()
              }
            }}
            slotProps={{
              htmlInput: {
                maxLength: maxMessageLength
              }
            }}
            size='small'
            sx={{ width: '100%' }}
          />
          <Button
            disabled={!sendEnabled}
            loading={isMutating}
            sx={{ ml: 1 }}
            variant="contained"
            endIcon={<Send />}
            onClick={sendMessage}
          >
            {t('send')}
          </Button>
        </Box>
      )}
    </>
  )
}
