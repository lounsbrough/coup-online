import { useEffect, useState } from "react"
import { Box, Breadcrumbs, Button, Grid2, TextField, Typography } from "@mui/material"
import { AccountCircle } from "@mui/icons-material"
import useSWRMutation from "swr/mutation"
import { useNavigate } from "react-router-dom"
import { getPlayerId } from "../../helpers/playerId"
import { Link } from "react-router-dom"

function CreateGame() {
  const [playerName, setPlayerName] = useState('')
  const [error, setError] = useState<string>()
  const navigate = useNavigate()

  const { trigger, isMutating, error: swrError } = useSWRMutation(`${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8008'}/createGame`, (async (url: string, { arg }: { arg: { playerId: string; playerName: string; }; }) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(arg)
    }).then(async (res) => {
      if (res.ok) {
        const roomId = (await res.json()).roomId
        navigate(`/game?roomId=${roomId}`)
      } else {
        setError('Error creating game')
      }
    })
  }))

  useEffect(() => {
    if (swrError) {
      console.log(swrError)
      setError('Error creating game')
    }
  }, [swrError])

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
          setError(undefined)
          setPlayerName(playerName.trim())

          if (!playerName.trim()) {
            setError('Player Name is required')
          }

          if (playerName.trim().length > 10) {
            setError('Player Name must be 10 characters or less')
          }

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
