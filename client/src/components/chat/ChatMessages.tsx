import { useState } from "react"
import { Box, IconButton, Popover, Tooltip, Typography } from "@mui/material"
import { AddReaction, Delete as DeleteIcon, Restore as RestoreIcon } from "@mui/icons-material"
import EmojiPicker, { Theme } from 'emoji-picker-react'
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import useGameMutation from "../../hooks/useGameMutation"
import { PlayerActions } from "@shared"
import { getPlayerId } from "../../helpers/players"
import { useColorModeContext } from "../../contexts/MaterialThemeContext"

export default function ChatMessages() {
  const [emojiMessageId, setEmojiMessageId] = useState<string>()
  const [emojiPickerAnchorEl, setEmojiPickerAnchorEl] = useState<HTMLButtonElement | null>(null)
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()
  const { colorMode } = useColorModeContext()

  const setChatMessageDeletedMutation = useGameMutation<{
    roomId: string, playerId: string, messageId: string, deleted: boolean
  }>({ action: PlayerActions.setChatMessageDeleted })

  const setEmojiOnChatMessageMutation = useGameMutation<{
    roomId: string, playerId: string, messageId: string, emoji: string, selected: boolean
  }>({ action: PlayerActions.setEmojiOnChatMessage })

  if (!gameState?.chatMessages?.length) {
    return <Typography>
      {t('noChatMessages')}
    </Typography>
  }

  console.log(gameState.chatMessages)

  return (
    <>
      {(
        gameState.chatMessages.map(({ id, text, from, deleted, timestamp, emojis }) => {
          const isMyMessage = from === gameState.selfPlayer?.name
          const SetDeletedIcon = deleted ? RestoreIcon : DeleteIcon

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
                {deleted ? t('messageWasDeleted') : text}
              </Typography>
              <Typography fontSize='smaller'>
                <Tooltip title={timestamp.toLocaleString()}>
                  <span>{timestamp.toLocaleTimeString()}</span>
                </Tooltip>
                {isMyMessage && (
                  <IconButton
                    sx={{ my: -0.5, mr: -1 }}
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
                    <SetDeletedIcon
                      fontSize="small"
                      sx={{ verticalAlign: 'text-bottom' }}
                    />
                  </IconButton>
                )}
                <IconButton
                  onClick={(event) => {
                    setEmojiPickerAnchorEl(event.currentTarget)
                    setEmojiMessageId(id)
                  }}
                  sx={{ my: -0.5 }}
                >
                  <AddReaction
                    fontSize="small"
                    sx={{ verticalAlign: 'text-bottom' }}
                  />
                </IconButton>
                {emojis && Object.entries(emojis).map(([emoji, playerNames]) => (
                  <Tooltip
                    key={emoji}
                    title={[...playerNames].join(',')}
                  >
                    <IconButton
                      sx={{
                        my: -0.5,
                        height: '35px',
                        color: 'inherit',
                      }}
                      onClick={() => {
                        setEmojiOnChatMessageMutation.trigger({
                          roomId: gameState.roomId,
                          playerId: getPlayerId(),
                          messageId: id,
                          emoji,
                          selected: true
                        })
                      }}
                    >
                      <Typography>{emoji} {playerNames.size > 1 ? playerNames.size : null}</Typography>
                    </IconButton>
                  </Tooltip>
                ))}
              </Typography>
            </Box>
          )
        })
      )}
      <Popover
        id="emoji-popover"
        open={!!emojiPickerAnchorEl}
        anchorEl={emojiPickerAnchorEl}
        slotProps={{
          paper: { sx: { backgroundColor: 'transparent', boxShadow: 'none' } }
        }}
        onClose={() => { setEmojiPickerAnchorEl(null) }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <EmojiPicker
          open
          reactionsDefaultOpen
          lazyLoadEmojis
          theme={colorMode === 'light' ? Theme.LIGHT : Theme.DARK}
          onEmojiClick={(emojiData) => {
            if (!emojiMessageId) throw new Error("Unable to determine message id")
            setEmojiOnChatMessageMutation.trigger({
              roomId: gameState.roomId,
              playerId: getPlayerId(),
              messageId: emojiMessageId,
              emoji: emojiData.emoji,
              selected: true
            })
          }}
        />
      </Popover>
    </>
  )
}
