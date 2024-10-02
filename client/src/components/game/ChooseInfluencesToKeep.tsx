import { useState } from "react"
import { Button, Checkbox, Grid2, Typography } from "@mui/material"
import { getPlayerId } from "../../helpers/playerId"
import { useGameStateContext } from "../../contexts/GameStateContext"
import PlayerActionConfirmation from "./PlayerActionConfirmation"

function ChooseInfluencesToKeep() {
  const [checkedIndexes, setCheckedIndexes] = useState<number[]>([])
  const { gameState } = useGameStateContext()

  if (!gameState) {
    return null
  }

  const influenceCountToKeep = gameState.selfPlayer.influences.length
    - gameState.pendingInfluenceLoss[gameState.selfPlayer.name]
      .filter(({ putBackInDeck }) => putBackInDeck).length

  if (checkedIndexes.length === influenceCountToKeep) {
    return <PlayerActionConfirmation
      message={`Keeping ${gameState.selfPlayer.influences.filter((_i, index) => checkedIndexes.includes(index)).join(' and ')}`}
      endpoint="loseInfluences"
      variables={{
        roomId: gameState.roomId,
        playerId: getPlayerId(),
        influences: gameState.selfPlayer.influences.filter((_i, index) =>
          !checkedIndexes.includes(index))
      }}
      onCancel={() => {
        setCheckedIndexes([])
      }}
    />
  }

  return (
    <>
      <Typography sx={{ my: 1, fontWeight: 'bold' }}>
        {`Choose ${influenceCountToKeep} Influence${influenceCountToKeep === 1 ? '' : 's'} to Keep`}
      </Typography>
      <Grid2 container spacing={2} justifyContent="center">
        {gameState.selfPlayer.influences
          .sort((a, b) => a.localeCompare(b))
          .map((influence, index) => {
            return <Button
              key={index}
              disabled={checkedIndexes.length === 2 && !checkedIndexes.includes(index)}
              onClick={() => {
                if (checkedIndexes.includes(index)) {
                  setCheckedIndexes((prev) => prev.filter((i) => i !== index))
                } else {
                  setCheckedIndexes((prev) => [
                    ...prev,
                    index
                  ])
                }
              }}
              color={influence}
              variant="contained"
            >
              <Checkbox
                color="default"
                sx={{ color: 'inherit', p: 0, pr: 1 }}
                checked={checkedIndexes.includes(index)}
              />
              {influence}
            </Button>
          })}
      </Grid2>
    </>
  )
}

export default ChooseInfluencesToKeep
