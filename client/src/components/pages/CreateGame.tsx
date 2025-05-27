import { useCallback, useState } from "react"
import { Box, Breadcrumbs, Button, Grid, Slider, TextField, Typography } from "@mui/material"
import { AccountCircle } from "@mui/icons-material"
import { Link, useNavigate } from "react-router"
import { getPlayerId } from "../../helpers/players"
import { Analytics } from '@vercel/analytics/react'
import { GameSettings, PlayerActions, DehydratedPublicGameState } from '@shared'
import useGameMutation from "../../hooks/useGameMutation"
import { useTranslationContext } from "../../contexts/TranslationsContext"

function CreateGame() {
  const [playerName, setPlayerName] = useState('')
  const [eventLogRetentionTurns, setEventLogRetentionTurns] = useState(3)
  const navigate = useNavigate()
  const { t } = useTranslationContext()

  const navigateToRoom = useCallback((gameState: DehydratedPublicGameState) => {
    navigate(`/game?roomId=${gameState.roomId}`)
  }, [navigate])

  const { trigger, isMutating, error } = useGameMutation<{
    playerId: string, playerName: string, settings: GameSettings
  }>({ action: PlayerActions.createGame, callback: navigateToRoom })

  return (
    <>
      <Analytics />
      <Breadcrumbs sx={{ m: 2 }} aria-label="breadcrumb">
        <Link to='/'>
          {t('home')}
        </Link>
        <Typography>
          {t('createNewGame')}
        </Typography>
      </Breadcrumbs>
      <Typography variant="h5" sx={{ m: 5 }}>
        {t('createNewGame')}
      </Typography>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          trigger({
            playerId: getPlayerId(),
            playerName: playerName.trim(),
            settings: { eventLogRetentionTurns }
          })
        }}
      >
        <Grid container direction="column" alignItems='center'>
          <Grid>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 3 }}>
              <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
              <TextField
                data-testid='playerNameInput'
                value={playerName}
                onChange={(event) => {
                  setPlayerName(event.target.value.slice(0, 10))
                }}
                label={t('whatIsYourName')}
                variant="standard"
                required
              />
            </Box>
          </Grid>

          <Grid sx={{ maxWidth: '300px', width: '90%' }}>
            <Box p={2} mt={2}>
              <Typography mt={2}>
                {t('eventLogRetentionTurns')}
                {`: ${eventLogRetentionTurns}`}
              </Typography>
              <Slider
                data-testid='eventLogRetentionTurnsInput'
                step={1}
                value={eventLogRetentionTurns}
                valueLabelDisplay="auto"
                min={1}
                max={100}
                onChange={(_: Event, value: number | number[]) => {
                  setEventLogRetentionTurns(value as number)
                }}
              />
            </Box>
          </Grid>
        </Grid>
        <Grid>
          <Button
            type="submit"
            sx={{ mt: 5 }}
            variant="contained"
            loading={isMutating}
          >
            {t('createGame')}
          </Button>
        </Grid>
        {error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{error}</Typography>}
      </form>
    </>
  )
}

export default CreateGame
