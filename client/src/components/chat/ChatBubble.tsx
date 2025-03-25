import { useEffect, useState } from 'react'
import Fab from '@mui/material/Fab'
import ChatIcon from '@mui/icons-material/Chat'
import ChatDialog from './ChatDialog'
import { getLatestReadMessageIdStorageKey } from '../../helpers/localStorageKeys'
import { useGameStateContext } from '../../contexts/GameStateContext'

export default function ChatBubble() {
  const [chatOpen, setChatOpen] = useState(false)
  const [latestReadMessageId, setLatestReadMessageId] = useState<string | null>()
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
  const { gameState } = useGameStateContext()

  if (!gameState) {
    return null
  }

  useEffect(() => {
    setLatestReadMessageId(localStorage.getItem(getLatestReadMessageIdStorageKey(gameState.roomId)))
  }, [gameState.roomId])

  useEffect(() => {
    setHasUnreadMessages(!chatOpen && (latestReadMessageId ?? null) !== (gameState.chatMessages.at(-1)?.id ?? null))
  }, [chatOpen, latestReadMessageId, gameState.chatMessages.length])

  return (
    <>
      <Fab
        onClick={() => { setChatOpen(true) }}
        color={hasUnreadMessages ? 'info' : 'primary'}
        sx={{
          mr: 3,
          mb: 3,
          position: 'fixed',
          bottom: 0,
          right: 0,
          animation: hasUnreadMessages ? 'pulse 1.5s infinite' : undefined
        }}
      >
        <ChatIcon fontSize={hasUnreadMessages ? 'large' : 'medium'} />
      </Fab >
      <ChatDialog
        isOpen={chatOpen}
        handleClose={() => { setChatOpen(false) }}
        setLatestReadMessageId={setLatestReadMessageId}
      />
    </>
  )
}
