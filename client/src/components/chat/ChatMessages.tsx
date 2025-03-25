import { Box, IconButton, Tooltip, Typography } from "@mui/material"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import { Delete as DeleteIcon, Restore as RestoreIcon } from "@mui/icons-material"
import useGameMutation from "../../hooks/useGameMutation"
import { PlayerActions } from "@shared"
import { getPlayerId } from "../../helpers/players"

export default function ChatMessages() {
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  const { trigger, isMutating } = useGameMutation<{
    roomId: string, playerId: string, messageId: string, deleted: boolean
  }>({
    action: PlayerActions.setChatMessageDeleted
  })

  if (!gameState?.chatMessages?.length) {
    return <Typography>
      {t('noChatMessages')}
    </Typography>
  }

  return gameState.chatMessages.map(({ id, text, from, deleted, timestamp }) => {
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
              size="small"
              sx={{ my: -0.5, mr: -1 }}
              loading={isMutating}
              onClick={() => {
                trigger({
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
        </Typography>
      </Box>
    )
  })
}
