import { useCallback, useState } from "react"
import { Box, Breadcrumbs, Button, Grid2, TextField, Typography } from "@mui/material"
import { AccountCircle } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { getPlayerId } from "../../helpers/players"
import { Link } from "react-router-dom"
import { Analytics } from '@vercel/analytics/react'
import { PlayerActions, PublicGameState } from '@shared'
import useGameMutation from "../../hooks/useGameMutation"

function CreateGame() {
  const [playerName, setPlayerName] = useState('')
  const navigate = useNavigate()

  const navigateToRoom = useCallback((gameState: PublicGameState) => {
    navigate(`/game?roomId=${gameState.roomId}`)
  }, [navigate])

  const { trigger, isMutating, error } = useGameMutation<{
    playerId: string, playerName: string
  }>({ action: PlayerActions.createGame, callback: navigateToRoom })

  return (
    <>
      <Analytics />
      <Breadcrumbs sx={{ m: 2 }} aria-label="breadcrumb">
        <Link to='/'>Home</Link>
        <Typography>Create Game</Typography>
      </Breadcrumbs>
      <Typography variant="h5" sx={{ m: 5 }}>Create a New Game</Typography>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          trigger({
            playerId: getPlayerId(),
            playerName: playerName.trim()
          })
        }}
      >
        <Grid2 container direction="column" alignContent='center'>
          <Grid2>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 3 }}>
              <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
              <TextField
                value={playerName}
                onChange={(event) => {
                  setPlayerName(event.target.value.slice(0, 10))
                }}
                label="What is your name?"
                variant="standard"
                required
              />
            </Box>
          </Grid2>
        </Grid2>
        <Grid2>
          <Button
            type="submit"
            sx={{ mt: 5 }}
            variant="contained"
            disabled={isMutating}
          >Create Game</Button>
        </Grid2>
        {error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{error}</Typography>}
      </form>
    </>
  )
}

export default CreateGame
