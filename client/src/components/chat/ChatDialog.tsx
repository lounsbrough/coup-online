import { useState, forwardRef, useEffect, useRef } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Slide from '@mui/material/Slide'
import { TransitionProps } from '@mui/material/transitions'
import ChatMessages from './ChatMessages'
import { useTranslationContext } from '../../contexts/TranslationsContext'
import { Send as SendIcon } from '@mui/icons-material'
import { Box, TextField, Typography, useMediaQuery } from '@mui/material'
import useGameMutation from '../../hooks/useGameMutation'
import { PlayerActions } from '@shared'
import { getPlayerId } from '../../helpers/players'
import { useGameStateContext } from '../../contexts/GameStateContext'
import { getLatestReadMessageIdStorageKey } from '../../helpers/localStorageKeys'

const SlideTransition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} appear />
})

interface ChatDialogProps {
  isOpen: boolean
  handleClose: () => void
  setLatestReadMessageId: (id: string) => void
}

export default function ChatDialog({
  isOpen, handleClose, setLatestReadMessageId
}: ChatDialogProps) {
  const scrollingMessageBoxRef = useRef<HTMLElement>(null)
  const messageTextInputRef = useRef<HTMLInputElement>(null)
  const [pendingMessageText, setPendingMessageText] = useState('')
  const [pendingMessageId, setPendingMessageId] = useState('')
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()
  const smallLandscapeScreen = useMediaQuery('@media (orientation: landscape) and (max-height: 800px)')

  if (!gameState) {
    return null
  }

  const { trigger, isMutating, error } = useGameMutation<{
    roomId: string, playerId: string, messageId: string, messageText: string
  }>({
    action: PlayerActions.sendChatMessage,
    callback: () => {
      setPendingMessageText('')
      setPendingMessageId('')
    }
  })

  const maxMessageLength = 500

  const sendMessage = () => {
    trigger({
      roomId: gameState.roomId,
      playerId: getPlayerId(),
      messageId: pendingMessageId,
      messageText: pendingMessageText.trim()
    })
  }

  const sendEnabled = !!pendingMessageText.trim() && !!pendingMessageId

  useEffect(() => {
    if (!isOpen) return

    const latestMessageId = gameState.chatMessages.at(-1)?.id
    if (latestMessageId) {
      setLatestReadMessageId(latestMessageId)
      localStorage.setItem(getLatestReadMessageIdStorageKey(gameState.roomId), latestMessageId)
    }

    scrollingMessageBoxRef.current?.scrollTo({
      top: scrollingMessageBoxRef.current.scrollHeight,
      behavior: "smooth"
    })
  }, [isOpen, gameState.roomId, gameState.chatMessages.length])

  useEffect(() => {
    if (isOpen && messageTextInputRef.current) {
      messageTextInputRef.current.focus()
    }
  }, [isOpen, messageTextInputRef.current])

  return (
    <>
      <Dialog
        open={isOpen}
        slots={{ transition: SlideTransition }}
        keepMounted
        fullWidth
        onClose={handleClose}
        aria-describedby="chat-dialog"
      >
        <DialogTitle>{t('chat')}</DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <Box
            ref={scrollingMessageBoxRef}
            sx={{
              overflow: 'auto',
              maxHeight: smallLandscapeScreen ? '30vh' : '60vh'
            }}
          >
            <ChatMessages />
          </Box>
          <Box sx={{ mt: 3 }} display="flex" alignContent="center">
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
                  ref: messageTextInputRef,
                  maxLength: maxMessageLength
                }
              }}
              size='small'
              sx={{ width: '100%' }}
            ></TextField>
            <Button
              disabled={!sendEnabled}
              loading={isMutating}
              sx={{ ml: 1 }}
              variant="contained"
              endIcon={<SendIcon />}
              onClick={sendMessage}
            >
              {t('send')}
            </Button>
          </Box>
          {error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={handleClose}>{t('close')}</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
