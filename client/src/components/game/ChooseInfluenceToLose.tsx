import { Grid2, Typography } from "@mui/material"
import { Influences, PlayerActions } from '@shared'
import { useState } from "react"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import PlayerActionConfirmation from "./PlayerActionConfirmation"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import GrowingButton from "../utilities/GrowingButton"

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
        gameState,
        primaryInfluence: selectedInfluence
      })}
      action={PlayerActions.loseInfluences}
      variables={{
        influences: [selectedInfluence],
        playerId: getPlayerId(),
        roomId: gameState.roomId
      }}
      onCancel={() => {
        setSelectedInfluence(undefined)
      }}
    />
  }

  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 'bold', my: 1 }}>
        {t('chooseInfluenceToLose')}
      </Typography>
      <Grid2 container spacing={2} justifyContent="center">
        {gameState.selfPlayer.influences
          .sort((a, b) => a.localeCompare(b))
          .map((influence, index) => {
            return <GrowingButton
              key={index}
              onClick={() => {
                setSelectedInfluence(influence)
              }}
              color={influence}
              variant="contained"
            >
              {t(influence)}
            </GrowingButton>
          })}
      </Grid2>
    </>
  )
}

export default ChooseInfluenceToLose
