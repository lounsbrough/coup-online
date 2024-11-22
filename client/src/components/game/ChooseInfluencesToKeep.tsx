import { useState } from "react"
import { Button, Checkbox, Grid2, Typography } from "@mui/material"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import PlayerActionConfirmation from "./PlayerActionConfirmation"
import { PlayerActions } from "@shared"
import { useTranslationContext } from "../../contexts/TranslationsContext"

function ChooseInfluencesToKeep() {
  const [checkedIndexes, setCheckedIndexes] = useState<number[]>([])
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  if (!gameState?.selfPlayer) {
    return null
  }

  const influenceCountToKeep = gameState.selfPlayer.influences.length
    - gameState.pendingInfluenceLoss[gameState.selfPlayer.name]
      .filter(({ putBackInDeck }) => putBackInDeck).length

  if (checkedIndexes.length === influenceCountToKeep) {
    const influencesToKeep = gameState.selfPlayer.influences.filter((_i, index) => checkedIndexes.includes(index))
    return <PlayerActionConfirmation
      message={t('keepInfluences', {
        primaryInfluence: influencesToKeep[0],
        secondaryInfluence: influencesToKeep[1],
        count: influenceCountToKeep,
        gameState
      })}
      // message={`Keep ${influencesToKeep.join(' and ')}`}
      action={PlayerActions.loseInfluences}
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
      <Typography variant="h6" sx={{ my: 1, fontWeight: 'bold' }}>
        {t('chooseInfluencesToKeep', {
          count: influenceCountToKeep
        })}
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
              {t(influence)}
            </Button>
          })}
      </Grid2>
    </>
  )
}

export default ChooseInfluencesToKeep
