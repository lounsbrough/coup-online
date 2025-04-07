import { useEffect, useState } from 'react'
import Fab from '@mui/material/Fab'
import ChatIcon from '@mui/icons-material/Chat'
import ChatDialog from './ChatDialog'
import { getLatestReadMessageIdStorageKey } from '../../helpers/localStorageKeys'
import { useGameStateContext } from '../../contexts/GameStateContext'
import { getDiscreteGradient } from '../../helpers/styles'

const fabSize = 56

export default function ChatBubble() {
  const [chatOpen, setChatOpen] = useState(false)
  const [latestReadMessageId, setLatestReadMessageId] = useState<string | null>()
  const [unreadMessagePlayerColors, setUnreadMessagePlayerColors] = useState<string[]>([])
  const { gameState } = useGameStateContext()

  if (!gameState) {
    return null
  }

  useEffect(() => {
    setLatestReadMessageId(localStorage.getItem(getLatestReadMessageIdStorageKey(gameState.roomId)))
  }, [gameState.roomId])

  useEffect(() => {
    if (!chatOpen) {
      const unreadMessagePlayerNames = new Set<string>()
      let reachedLatestRead = false
      gameState.chatMessages.forEach(({ id, from }) => {
        if ((!latestReadMessageId || reachedLatestRead) && from !== gameState.selfPlayer?.name) {
          unreadMessagePlayerNames.add(from)
        }
        if (latestReadMessageId === id) reachedLatestRead = true
      })
      const playerNameToColorMap: { [name: string]: string } = {}
      gameState.players.forEach(({ name, color }) => {
        playerNameToColorMap[name] = color
      })

      setUnreadMessagePlayerColors([...unreadMessagePlayerNames].map((name) => playerNameToColorMap[name]))
    } else {
      setUnreadMessagePlayerColors([])
    }
  }, [chatOpen, latestReadMessageId, gameState.chatMessages.length])

  const fabBackground = getDiscreteGradient(unreadMessagePlayerColors)

  return (
    <>
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
          animation: unreadMessagePlayerColors.length ? 'pulseChatBubble 5s infinite' : undefined,
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
      <ChatDialog
        isOpen={chatOpen}
        handleClose={() => { setChatOpen(false) }}
        setLatestReadMessageId={setLatestReadMessageId}
      />
    </>
  )
}
