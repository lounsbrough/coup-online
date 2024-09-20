import { Button, Grid2, Typography } from "@mui/material"
import { InfluenceAttributes, Influences } from "../../shared/types/game"
import { useState } from "react"
import { getPlayerId } from "../../helpers/playerId"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useColorModeContext } from "../../contexts/MaterialThemeContext"
import PlayerActionConfirmation from "./PlayerActionConfirmation"

function ChooseInfluenceToLose() {
  const [selectedInfluence, setSelectedInfluence] = useState<Influences>()
  const { gameState } = useGameStateContext()
  const { colorMode } = useColorModeContext()

  if (!gameState) {
    return null
  }

  if (selectedInfluence) {
    return <PlayerActionConfirmation
      message={`Losing ${selectedInfluence}`}
      endpoint="loseInfluences"
      variables={{
        roomId: gameState.roomId,
        playerId: getPlayerId(),
        influences: [selectedInfluence]
      }}
      onCancel={() => {
        setSelectedInfluence(undefined)
      }}
    />
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
                setSelectedInfluence(influence)
              }}
              sx={{
                background: InfluenceAttributes[influence].color[colorMode]
              }} variant="contained"
            >
              {influence}
            </Button>
          })}
      </Grid2>
    </>
  )
}

export default ChooseInfluenceToLose
