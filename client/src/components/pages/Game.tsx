import { Button, Grid2, Typography } from "@mui/material"
import GameBoard from "../game/GameBoard"
import WaitingRoom from "../game/WaitingRoom"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { Link } from "react-router"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import ChatBubble from "../chat/ChatBubble"

function Game() {
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  return (
    <>
      {gameState && !gameState.selfPlayer && (
        <Grid2 mt={2} container spacing={2} direction="column">
          <Grid2>
            <Typography variant="h6" my={3}>
              {t('youAreNotInGame')}
            </Typography>
          </Grid2>
          <Grid2>
            <Link to={`/join-game?roomId=${gameState.roomId}`}>
              <Button variant="contained">
                {t('joinGame')}
              </Button>
            </Link>
          </Grid2>
        </Grid2>
      )}
      {gameState && gameState.isStarted && gameState.selfPlayer && (
        <GameBoard />
      )}
      {gameState && !gameState.isStarted && gameState.selfPlayer && (
        <WaitingRoom />
      )}
      {gameState && gameState.selfPlayer && (
        <ChatBubble />
      )}
    </>
  )
}

export default Game
