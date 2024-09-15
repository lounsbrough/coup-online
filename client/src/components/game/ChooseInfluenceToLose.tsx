import { Button, Grid2, Typography } from "@mui/material"
import { InfluenceAttributes, Influences } from "../../shared/types/game"
import useSWRMutation from "swr/mutation"
import { useState } from "react"
import { getPlayerId } from "../../helpers/playerId"
import { useGameStateContext } from "../../context/GameStateContext"
import { useColorModeContext } from "../../context/MaterialThemeContext"

function ChooseInfluenceToLose() {
  const [error, setError] = useState<string>()
  const { gameState, setGameState } = useGameStateContext()
  const { colorMode } = useColorModeContext()

  const { trigger, isMutating } = useSWRMutation(`${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8008'}/loseInfluences`, (async (url: string, { arg }: { arg: { roomId: string, playerId: string; influences: Influences[] }; }) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(arg)
    }).then(async (res) => {
      if (res.ok) {
        setGameState(await res.json())
      } else {
        setError('Error losing influence')
      }
    })
  }))

  if (!gameState) {
    return null
  }

  return (
    <>
      <Typography sx={{ my: 1, fontWeight: 'bold' }}>
        {'Choose an Influence to Lose'}
      </Typography>
      <Grid2 container spacing={2} justifyContent="center">
        {gameState.selfPlayer.influences
          .sort((a, b) => a.localeCompare(b))
          .map((influence, index) => {
            return <Button
              key={index}
              onClick={() => {
                trigger({
                  roomId: gameState.roomId,
                  playerId: getPlayerId(),
                  influences: [influence]
                })
              }}
              sx={{
                background: InfluenceAttributes[influence].color[colorMode]
              }} variant="contained"
              disabled={isMutating}
            >
              {influence}
            </Button>
          })}
      </Grid2>
      {error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{error}</Typography>}
    </>
  )
}

export default ChooseInfluenceToLose
