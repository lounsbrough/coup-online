import { Button, Grid2, Typography } from "@mui/material"
import { Influences, PlayerActions } from '@shared'
import { useState } from "react"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import PlayerActionConfirmation from "./PlayerActionConfirmation"

function ChooseInfluenceToLose() {
  const [selectedInfluence, setSelectedInfluence] = useState<Influences>()
  const { gameState } = useGameStateContext()

  if (!gameState) {
    return null
  }

  if (selectedInfluence) {
    return <PlayerActionConfirmation
      message={`Lose ${selectedInfluence}`}
      action={PlayerActions.loseInfluences}
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
      <Typography variant="h6" sx={{ my: 1, fontWeight: 'bold' }}>
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
              color={influence}
              variant="contained"
            >
              {influence}
            </Button>
          })}
      </Grid2>
    </>
  )
}

export default ChooseInfluenceToLose
