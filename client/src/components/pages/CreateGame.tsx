import { useState } from "react"
import { Box, Breadcrumbs, Button, Grid2, TextField, Typography } from "@mui/material"
import { AccountCircle } from "@mui/icons-material"
import useSWRMutation from "swr/mutation"
import { useNavigate } from "react-router-dom"
import { getPlayerId } from "../../helpers/playerId"
import { Link } from "react-router-dom"
import { useWebSocketContext } from "../../contexts/WebSocketContext"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { PublicGameState } from '@shared'

type CreateGameParams = { playerId: string, playerName: string }

const createGameEvent = 'createGame'

function CreateGame() {
  const [playerName, setPlayerName] = useState('')
  const [error, setError] = useState<string>()
  const navigate = useNavigate()
  const { socket } = useWebSocketContext()
  const { setGameState } = useGameStateContext()

  const updateGameStateAndNavigate = (gameState: PublicGameState) => {
    setGameState(gameState)
    navigate(`/game?roomId=${gameState.roomId}`)
  }

  const { trigger: triggerSwr, isMutating } = useSWRMutation(`${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8008'}/${createGameEvent}`, (async (url: string, { arg }: {
    arg: CreateGameParams;
  }) => {
    setError(undefined)
    return fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(arg)
    }).then(async (res) => {
      if (res.ok) {
        const gameState = await res.json()
        updateGameStateAndNavigate(gameState)
      } else {
        if (res.status === 400) {
          setError(await res.text())
        } else {
          setError('Error creating game')
        }
      }
    })
  }))

  const trigger = socket?.connected
    ? (params: CreateGameParams) => {
      socket.removeAllListeners('gameStateChanged').on('gameStateChanged', (gameState) => {
        updateGameStateAndNavigate(gameState)
      })
      socket.removeAllListeners('error').on('error', (error) => { setError(error) })
      socket.emit(createGameEvent, params)
    }
    : triggerSwr

  return (
    <>
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
        }}>
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
            type="submit" sx={{ mt: 5 }}
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
