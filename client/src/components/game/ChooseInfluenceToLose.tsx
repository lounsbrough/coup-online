import { Button, Grid2, Typography } from "@mui/material"
import { Influences, PlayerActions } from '@shared'
import { useState } from "react"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import PlayerActionConfirmation from "./PlayerActionConfirmation"
import { useTranslationContext } from "../../contexts/TranslationsContext"

function ChooseInfluenceToLose() {
  const [selectedInfluence, setSelectedInfluence] = useState<Influences>()
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  if (!gameState?.selfPlayer) {
    return null
  }

  if (selectedInfluence) {
    return <PlayerActionConfirmation
      message={t('loseInfluence', {
        primaryInfluence: selectedInfluence,
        gameState
      })}
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
        {t('chooseInfluenceToLose')}
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
              {t(influence)}
            </Button>
          })}
      </Grid2>
    </>
  )
}

export default ChooseInfluenceToLose
