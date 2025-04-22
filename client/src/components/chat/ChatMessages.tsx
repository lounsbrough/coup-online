import { useState } from "react"
import { Box, IconButton, Popover, TextField, Tooltip, Typography } from "@mui/material"
import { AddReaction as AddReactionIcon, Cancel, Check, Delete as DeleteIcon, Edit, Restore as RestoreIcon } from "@mui/icons-material"
import EmojiPicker, { Theme } from 'emoji-picker-react'
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import useGameMutation from "../../hooks/useGameMutation"
import { PlayerActions } from "@shared"
import { getPlayerId } from "../../helpers/players"
import { useColorModeContext } from "../../contexts/MaterialThemeContext"
import './ChatMessages.css'

export default function ChatMessages() {
  const [editingMessage, setEditingMessage] = useState<{ id: string, text: string }>()
  const [emojiMessageId, setEmojiMessageId] = useState<string>()
  const [emojiPickerAnchorEl, setEmojiPickerAnchorEl] = useState<HTMLButtonElement | null>(null)
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()
  const { colorMode } = useColorModeContext()

  const sendChatMessageMutation = useGameMutation<{
    roomId: string, playerId: string, messageId: string, messageText: string
  }>({
    action: PlayerActions.sendChatMessage, callback: () => {
      setEditingMessage(undefined)
    }
  })

  const setChatMessageDeletedMutation = useGameMutation<{
    roomId: string, playerId: string, messageId: string, deleted: boolean
  }>({ action: PlayerActions.setChatMessageDeleted })

  const setEmojiOnChatMessageMutation = useGameMutation<{
    roomId: string, playerId: string, messageId: string, emoji: string, selected: boolean
  }>({ action: PlayerActions.setEmojiOnChatMessage })

  const maxMessageLength = 500

  return (
    <>
      {(
        !gameState?.chatMessages?.length ? (
          <Typography my={2} textAlign="center">
            {t('noChatMessages')}
          </Typography>
        ) : (
          gameState.chatMessages.map(({ id, text, from, deleted, timestamp, emojis }) => {
            const isMyMessage = from === gameState.selfPlayer?.name
            const SetDeletedIcon = deleted ? RestoreIcon : DeleteIcon

            const sendMessage = () => {
              if (editingMessage && !sendChatMessageMutation.isMutating) {
                sendChatMessageMutation.trigger({
                  roomId: gameState.roomId,
                  playerId: getPlayerId(),
                  messageId: editingMessage.id || id,
                  messageText: editingMessage.text.trim(),
                })
              }
            }

            return (
              <Box
                key={id}
                sx={{
                  px: 1,
                  py: 0.5,
                  textAlign: isMyMessage ? 'right' : 'left',
                  borderBottom: '1px solid rgba(120, 120, 120, 0.2)'
                }}
              >
                {!isMyMessage && (
                  <Typography
                    component='span'
                    fontWeight={500}
                    fontSize='inherit'
                    sx={{ color: gameState?.players.find(({ name }) => name === from)?.color }}
                  >
                    {from}:
                  </Typography>
                )}
                <Typography
                  component="span"
                  sx={{
                    ml: 0.5,
                    ...(deleted && { fontStyle: 'italic', fontSize: 'smaller' })
                  }}
                >
                  {deleted ? t('messageWasDeleted') : (
                    editingMessage?.id === id ? (
                      <TextField
                        placeholder={t('writeNewMessage') as string}
                        label={`${editingMessage.text ? ` (${maxMessageLength - editingMessage.text.length}/${maxMessageLength})` : ''}`}
                        value={editingMessage.text}
                        onChange={(event) => {
                          setEditingMessage({
                            id: editingMessage.id,
                            text: event.target.value
                          })
                        }}
                        onKeyDown={(event) => {
                          if (!!editingMessage.text.trim() && event.key === 'Enter') {
                            sendMessage()
                          }
                        }}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <>
                                <IconButton
                                  sx={{ m: -0.5 }}
                                  disabled={sendChatMessageMutation.isMutating}
                                >
                                  <Cancel
                                    onClick={() => {
                                      setEditingMessage(undefined)
                                    }} />
                                </IconButton>
                                <IconButton
                                  sx={{ m: -0.5, mr: -2 }}
                                  disabled={!editingMessage.text.trim()}
                                  loading={sendChatMessageMutation.isMutating}
                                >
                                  <Check onClick={() => {
                                    sendMessage()
                                  }} />
                                </IconButton>
                              </>
                            )
                          },
                          htmlInput: {
                            maxLength: maxMessageLength
                          }
                        }}
                        size='small'
                        sx={{ width: '100%' }}
                      />
                    ) : text
                  )}
                </Typography>
                <Typography sx={{ mr: isMyMessage ? '-0.4rem' : undefined }}>
                  <Tooltip title={timestamp.toLocaleString()}>
                    <Typography fontSize='smaller' component="span" sx={{
                      mr: 1,
                      verticalAlign: 'middle'
                    }}>{timestamp.toLocaleTimeString()}</Typography>
                  </Tooltip>
                  {isMyMessage && (
                    <>
                      {!deleted && (
                        <IconButton
                          sx={{ m: -0.5 }}
                          loading={setChatMessageDeletedMutation.isMutating}
                          onClick={() => { setEditingMessage({ id, text }) }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        sx={{ m: -0.5 }}
                        loading={setChatMessageDeletedMutation.isMutating}
                        onClick={() => {
                          setChatMessageDeletedMutation.trigger({
                            roomId: gameState.roomId,
                            playerId: getPlayerId(),
                            messageId: id,
                            deleted: !deleted
                          })
                        }}
                      >
                        <SetDeletedIcon fontSize="small" />
                      </IconButton>
                    </>
                  )}
                  <IconButton
                    onClick={(event) => {
                      setEmojiPickerAnchorEl(event.currentTarget)
                      setEmojiMessageId(id)
                    }}
                    sx={{ m: -0.5 }}
                  >
                    <AddReactionIcon fontSize="small" />
                  </IconButton>
                  {emojis && Object.entries(emojis).map(([emoji, playerNames]) => (
                    <Tooltip
                      key={emoji}
                      title={[...playerNames].join(', ')}
                    >
                      <IconButton
                        size="small"
                        sx={{
                          my: -0.5,
                          height: '28px',
                          color: 'inherit',
                        }}
                        onClick={() => {
                          const selected = !gameState.selfPlayer?.name || !playerNames.has(gameState.selfPlayer?.name)
                          setEmojiOnChatMessageMutation.trigger({
                            roomId: gameState.roomId,
                            playerId: getPlayerId(),
                            messageId: id,
                            emoji,
                            selected
                          })
                        }}
                      >
                        <Typography>{emoji}</Typography>
                        {playerNames.size > 1 && <Typography ml={0.5} fontWeight={900}>{playerNames.size}</Typography>}
                      </IconButton>
                    </Tooltip>
                  ))}
                </Typography>
              </Box>
            )
          })
        )
      )}
      <Popover
        slotProps={{ paper: { sx: { background: 'transparent' } } }}
        id="emoji-popover"
        open={!!emojiPickerAnchorEl}
        anchorEl={emojiPickerAnchorEl}
        onClose={() => { setEmojiPickerAnchorEl(null) }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <EmojiPicker
          open
          lazyLoadEmojis
          theme={colorMode === 'light' ? Theme.LIGHT : Theme.DARK}
          onEmojiClick={(emojiData) => {
            if (!gameState?.roomId) throw new Error("Unable to determine room id")
            if (!emojiMessageId) throw new Error("Unable to determine message id")
            setEmojiOnChatMessageMutation.trigger({
              roomId: gameState.roomId,
              playerId: getPlayerId(),
              messageId: emojiMessageId,
              emoji: emojiData.emoji,
              selected: true
            })
            setEmojiPickerAnchorEl(null)
          }}
        />
      </Popover>
    </>
  )
}
