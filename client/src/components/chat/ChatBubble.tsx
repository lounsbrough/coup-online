import { useEffect, useState } from 'react'
import Fab from '@mui/material/Fab'
import ChatIcon from '@mui/icons-material/Chat'
import { getLatestReadMessageIdStorageKey } from '../../helpers/localStorageKeys'
import { useGameStateContext } from '../../contexts/GameStateContext'
import { getDiscreteGradient } from '../../helpers/styles'

const fabSize = 56

interface ChatBubbleProps {
  chatOpen: boolean
  setChatOpen: (open: boolean) => void
  latestReadMessageId: string | null
  setLatestReadMessageId: (id: string | null) => void
}

export default function ChatBubble({ chatOpen, setChatOpen, latestReadMessageId, setLatestReadMessageId }: ChatBubbleProps) {
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
  const [unreadMessagePlayerColors, setUnreadMessagePlayerColors] = useState<string[]>([])
  const { gameState } = useGameStateContext()

  useEffect(() => {
    if (!gameState) return
    setLatestReadMessageId(localStorage.getItem(getLatestReadMessageIdStorageKey(gameState.roomId)))
  }, [gameState?.roomId])

  useEffect(() => {
    if (!gameState) return
    if (!chatOpen) {
      setHasUnreadMessages(!!gameState.chatMessages.length && (!latestReadMessageId || latestReadMessageId !== gameState.chatMessages.at(-1)?.id))

      const playerNameToColorMap: { [name: string]: string | undefined } = {}
      gameState.players.forEach(({ name, color }) => { playerNameToColorMap[name] = color })

      const unreadMessagePlayerColors = new Set<string>()
      let reachedLatestRead = false
      gameState.chatMessages.forEach(({ id, from }) => {
        if (
          (!latestReadMessageId || reachedLatestRead)
          && from !== gameState.selfPlayer?.name
          && playerNameToColorMap[from]) {
          unreadMessagePlayerColors.add(playerNameToColorMap[from])
        }
        if (latestReadMessageId === id) reachedLatestRead = true
      })

      setUnreadMessagePlayerColors([...unreadMessagePlayerColors])
    } else {
      setHasUnreadMessages(false)
      setUnreadMessagePlayerColors([])
    }
  }, [chatOpen, latestReadMessageId, gameState?.chatMessages.length, gameState?.players.length])

  if (!gameState) {
    return null
  }

  const fabBackground = getDiscreteGradient(unreadMessagePlayerColors)

  return (
    <Fab
      onClick={() => { setChatOpen(true) }}
      color="primary"
      sx={{
        height: fabSize,
        width: fabSize,
        mr: 3,
        mb: 3,
        position: 'fixed',
        bottom: 0,
        right: 0,
        background: fabBackground,
        '&:hover': { background: fabBackground },
        animation: hasUnreadMessages ? 'pulseChatBubble 5s infinite' : undefined,
        "@keyframes pulseChatBubble": {
          "0%": { transform: 'scale(1) rotateZ(0)' },
          "2%": { transform: 'scale(1.15) rotateZ(5deg)' },
          "4%": { transform: 'scale(1) rotateZ(0)' },
          "6%": { transform: 'scale(1.3) rotateZ(10deg)' },
          "20%": { transform: 'scale(1) rotateZ(0)' },
          "100%": { transform: 'scale(1) rotateZ(0)' }
        },
      }}
    >
      <ChatIcon fontSize='large' />
    </Fab>
  )
}
