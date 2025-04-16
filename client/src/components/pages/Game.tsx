import { Button, Grid2, Typography } from "@mui/material"
import GameBoard from "../game/GameBoard"
import WaitingRoom from "../game/WaitingRoom"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { Link } from "react-router"
import { useTranslationContext } from "../../contexts/TranslationsContext"

interface GameProps {
  leftDrawerOpen: boolean
  rightDrawerOpen: boolean
}

function Game({ leftDrawerOpen, rightDrawerOpen }: GameProps) {
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  if (!gameState) {
    return (
      <Grid2 mt={2} container spacing={2} direction="column">
        <Grid2>
          <Typography variant="h6" my={3}>
            {t('gameNotFound')}
          </Typography>
        </Grid2>
        <Grid2>
          <Link to={`/`}>
            <Button variant="contained">
              {t('home')}
            </Button>
          </Link>
        </Grid2>
      </Grid2>
    )
  }

  if (gameState && !gameState.selfPlayer) {
    return (
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
    )
  }

  return gameState.isStarted
    ? <GameBoard leftDrawerOpen={leftDrawerOpen} rightDrawerOpen={rightDrawerOpen} />
    : <WaitingRoom />
}

export default Game
