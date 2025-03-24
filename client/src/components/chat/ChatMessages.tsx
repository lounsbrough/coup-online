import { Typography } from "@mui/material"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useTranslationContext } from "../../contexts/TranslationsContext"

export default function ChatMessages() {
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  if (!gameState?.chatMessages?.length) {
    return <Typography>
      {t('noChatMessages')}
    </Typography>
  }

  return gameState.chatMessages.map(({ id, text, deleted, timestamp }) => (
    <Typography key={id}>
      {text}
      {deleted}
      <Typography fontSize='smaller'>{timestamp.toLocaleString()}</Typography>
    </Typography>
  ))
}
