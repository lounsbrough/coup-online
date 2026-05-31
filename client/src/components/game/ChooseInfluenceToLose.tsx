import { Grid } from "@mui/material"
import { Influences, PlayerActions } from '@shared'
import { useState } from "react"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import PlayerActionConfirmation from "./PlayerActionConfirmation"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import InfluenceButton from "./InfluenceButton"
import CoupTypography from '../utilities/CoupTypography'

function ChooseInfluenceToLose() {
  const [selectedInfluence, setSelectedInfluence] = useState<Influences>()
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  if (!gameState?.selfPlayer) {
    return null
  }

  const revealedInfluence = gameState.pendingInfluenceLoss[gameState.selfPlayer.name]?.[0]?.revealedInfluence

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
      <CoupTypography variant="h6" sx={{ fontWeight: 'bold', my: 1 }} addTextShadow>
        {t('chooseInfluenceToLose')}
      </CoupTypography>
      {revealedInfluence && (
        <CoupTypography variant="h6" sx={{ fontWeight: 'bold', my: 1 }} addTextShadow>
          {t('influenceWasRevealed', {
            gameState,
            primaryInfluence: revealedInfluence
          })}
        </CoupTypography>
      )}
      <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
        {gameState.selfPlayer.influences
          .sort((a, b) => a.localeCompare(b))
          .map((influence, index) => {
            return <InfluenceButton
              key={index}
              influence={influence}
              onClick={() => {
                setSelectedInfluence(influence)
              }}
            />
          })}
      </Grid>
    </>
  )
}

export default ChooseInfluenceToLose
