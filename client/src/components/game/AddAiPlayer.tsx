import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Slider, TextField, Typography } from "@mui/material"
import { useState } from "react"
import { Casino } from "@mui/icons-material"
import Bot from "../icons/Bot"
import useGameMutation from "../../hooks/useGameMutation"
import { AiPersonality, PlayerActions } from "@shared"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import BetaTag from "../utilities/BetaTag"
import { useTranslationContext } from "../../contexts/TranslationsContext"

const botNameIdeas = [
  'R2-D2',
  'HAL',
  'WALL-E',
  'Terminator',
  'RoboCop',
  'Baymax',
  'Data',
  'Sonny',
  'Optimus',
  'Gort',
  'Cylon',
  'Sentinel',
  'Replicant'
]

function AddAiPlayer({ addAiPlayerDialogOpen, setAddAiPlayerDialogOpen }: {
  addAiPlayerDialogOpen: boolean
  setAddAiPlayerDialogOpen: (open: boolean) => void
}) {
  const [botName, setBotName] = useState('')
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  const { trigger, isMutating, error } = useGameMutation<{
    roomId: string, playerId: string, playerName: string, personality: AiPersonality
  }>({
    action: PlayerActions.addAiPlayer,
    callback: () => {
      setAddAiPlayerDialogOpen(false)
      setBotName('')
    }
  })

  const minSliderValue = 0
  const maxSliderValue = 100

  const [vengefulness, setVengefulness] = useState<number>(50)
  const [honesty, setHonesty] = useState<number>(50)
  const [skepticism, setSkepticism] = useState<number>(50)

  const handleVengefulnessChange = (_: Event, value: number | number[]) => {
    setVengefulness(value as number)
  }
  const handleHonestyChange = (_: Event, value: number | number[]) => {
    setHonesty(value as number)
  }
  const handleSkepticismChange = (_: Event, value: number | number[]) => {
    setSkepticism(value as number)
  }

  if (!gameState) {
    return null
  }

  return (
    <Dialog
      open={addAiPlayerDialogOpen}
      onClose={() => { setAddAiPlayerDialogOpen(false) }}
      aria-labelledby="add-ai-player"
      aria-describedby="add-ai-player"
    >
      <DialogTitle>
        {(t('addAiPlayer'))}
        <BetaTag />
      </DialogTitle>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          trigger({
            roomId: gameState.roomId,
            playerId: getPlayerId(),
            playerName: botName.trim(),
            personality: { vengefulness, honesty, skepticism }
          })
        }}
      >
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Bot sx={{ mr: 1, my: 0.5 }} />
            <TextField
              value={botName}
              onChange={(event) => {
                setBotName(event.target.value.slice(0, 10))
              }}
              label={t('whatIsBotsName')}
              variant="standard"
              required
            />
            <Button
              variant="outlined"
              sx={{ ml: 1 }}
              startIcon={<Casino />}
              onClick={() => {
                const unusedIdeas = botNameIdeas.filter((idea) =>
                  idea !== botName &&
                  !gameState.players.some(({ name }) => name.toUpperCase() === idea.toUpperCase()))
                setBotName(unusedIdeas[Math.floor(Math.random() * unusedIdeas.length)])
              }}
              disabled={isMutating}
            >
              {t('random')}
            </Button>
          </Box>
          <Box p={2} mt={2}>
            <Typography mt={2}>
              {t('vengefulness')}
              {`: ${vengefulness}%`}
            </Typography>
            <Slider
              step={1}
              value={vengefulness}
              valueLabelDisplay="auto"
              min={minSliderValue}
              max={maxSliderValue}
              onChange={handleVengefulnessChange}
            />
            <Typography mt={2}>
              {t('honesty')}
              {`: ${honesty}%`}
            </Typography>
            <Slider
              step={1}
              value={honesty}
              valueLabelDisplay="auto"
              min={minSliderValue}
              max={maxSliderValue}
              onChange={handleHonestyChange}
            />
            <Typography mt={2}>
              {t('skepticism')}
              {`: ${skepticism}%`}
            </Typography>
            <Slider
              step={1}
              value={skepticism}
              valueLabelDisplay="auto"
              min={minSliderValue}
              max={maxSliderValue}
              onChange={handleSkepticismChange}
            />
          </Box>
          {error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => { setAddAiPlayerDialogOpen(false) }}
            disabled={isMutating}
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isMutating}
          >
            {t('add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddAiPlayer
