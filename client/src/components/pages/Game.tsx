import { Alert, Box, Button, CircularProgress, Grid, Typography } from "@mui/material"
import GameBoard from "../game/GameBoard"
import WaitingRoom from "../game/WaitingRoom"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { Link, useSearchParams } from "react-router"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import { Visibility } from "@mui/icons-material"

interface GameProps {
  leftDrawerOpen: boolean
  rightDrawerOpen: boolean
}

function Game({ leftDrawerOpen, rightDrawerOpen }: GameProps) {
  const { gameState, hasInitialStateLoaded } = useGameStateContext()
  const [searchParams] = useSearchParams()
  const { t } = useTranslationContext()
  const roomId = searchParams.get('roomId')

  if (roomId && !gameState && !hasInitialStateLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'var(--app-content-height)' }}>
        <CircularProgress size={50} />
      </Box>
    )
  }

  if (!gameState) {
    return (
      <Grid mt={2} container spacing={2} direction="column">
        <Grid>
          <Typography variant="h6" my={3}>
            {t('gameNotFound')}
          </Typography>
        </Grid>
        <Grid>
          <Link to={`/`}>
            <Button variant="contained">
              {t('home')}
            </Button>
          </Link>
        </Grid>
      </Grid>
    )
  }

  const spectatingAlert = gameState && !gameState.selfPlayer && (
    <Alert
      icon={<Visibility fontSize="inherit" />}
      severity="info"
      sx={{
        fontSize: 'larger',
        p: 0,
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {t('youAreSpectating')}
    </Alert>
  )

  return gameState.isStarted ? (
    // Google Translate doesn't work well with some React components
    // https://github.com/facebook/react/issues/11538
    // https://issues.chromium.org/issues/41407169
    <div className="notranslate">
      {spectatingAlert}
      <GameBoard leftDrawerOpen={leftDrawerOpen} rightDrawerOpen={rightDrawerOpen} />
    </div>
  ) : (
    <>
      {spectatingAlert}
      <WaitingRoom />
    </>
  )
}

export default Game
