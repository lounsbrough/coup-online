import { Box, Button, CircularProgress, Grid2, Typography } from "@mui/material"
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
  const { gameState, firstStateReturned } = useGameStateContext()
  const { t } = useTranslationContext()

  if (!gameState && !firstStateReturned) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'var(--app-content-height)' }}>
        <CircularProgress size={50} />
      </Box>
    )
  }

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

  return gameState.isStarted ? (
    // Google Translate doesn't work well with some React components
    // https://github.com/facebook/react/issues/11538
    // https://issues.chromium.org/issues/41407169
    <div className="notranslate">
      <GameBoard leftDrawerOpen={leftDrawerOpen} rightDrawerOpen={rightDrawerOpen} />
    </div>
  ) : <WaitingRoom />
}

export default Game
