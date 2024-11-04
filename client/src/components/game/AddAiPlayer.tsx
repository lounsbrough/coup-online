import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material"
import { useState } from "react"
import { Casino } from "@mui/icons-material"
import Bot from "../icons/Bot"
import useGameMutation from "../../hooks/useGameMutation"
import { PlayerActions } from "@shared"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import BetaTag from "../utilities/BetaTag"

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

  const { trigger, isMutating, error } = useGameMutation<{
    roomId: string, playerId: string, playerName: string
  }>({
    action: PlayerActions.addAiPlayer,
    callback: () => {
      setAddAiPlayerDialogOpen(false)
      setBotName('')
    }
  })

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
        Add AI Player
        <BetaTag />
      </DialogTitle>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          trigger({
            roomId: gameState.roomId.trim(),
            playerId: getPlayerId(),
            playerName: botName.trim()
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
              label="What is its name?"
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
              Random
            </Button>
          </Box>
          {error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => { setAddAiPlayerDialogOpen(false) }}
            disabled={isMutating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isMutating}
          >
            Add
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddAiPlayer
