import { Grid } from "@mui/material"
import { EventMessages, Influences, PlayerActions } from '@shared'
import { useState } from "react"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import PlayerActionConfirmation from "./PlayerActionConfirmation"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import InfluenceButton from "./InfluenceButton"
import CoupTypography from '../utilities/CoupTypography'

function ChooseChallengeResponse() {
  const [selectedInfluence, setSelectedInfluence] = useState<Influences>()
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  if (!gameState?.selfPlayer ||
    (!gameState?.pendingActionChallenge && !gameState?.pendingBlockChallenge)
  ) {
    return null
  }

  if (selectedInfluence) {
    return <PlayerActionConfirmation
      message={t('revealInfluence', {
        gameState,
        primaryInfluence: selectedInfluence
      })}
      action={gameState?.pendingActionChallenge ? PlayerActions.actionChallengeResponse : PlayerActions.blockChallengeResponse}
      variables={{
        influence: selectedInfluence,
        playerId: getPlayerId(),
        roomId: gameState.roomId
      }}
      onCancel={() => {
        setSelectedInfluence(undefined)
      }}
    />
  }

  const challengingPlayer = gameState.pendingBlockChallenge?.sourcePlayer || gameState.pendingActionChallenge?.sourcePlayer
  const challengedPlayer = gameState.pendingBlock?.sourcePlayer || gameState.turnPlayer

  return (
    <>
      <CoupTypography variant="h6" sx={{ fontWeight: 'bold', my: 1 }} addTextShadow>
        {t(EventMessages.ChallengePending, {
          gameState,
          primaryPlayer: challengingPlayer,
          secondaryPlayer: challengedPlayer
        })}
      </CoupTypography>
      <CoupTypography variant="h6" sx={{ fontWeight: 'bold', my: 1 }} addTextShadow>
        {t('chooseInfluenceToReveal')}
      </CoupTypography>
      {gameState.pendingBlock?.claimedInfluence && (
        <CoupTypography variant="h6" sx={{ fontWeight: 'bold', my: 1 }} addTextShadow>
          {t('influenceWasClaimed', {
            gameState,
            primaryInfluence: gameState.pendingBlock?.claimedInfluence
          })}
        </CoupTypography>
      )}
      <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
        {gameState.selfPlayer.influences
          .sort((a, b) => a.localeCompare(b))
          .map((influence, index) => {
            return <InfluenceButton
              key={index}
              influence={influence as Influences}
              onClick={() => {
                setSelectedInfluence(influence as Influences)
              }}
            />
          })}
      </Grid>
    </>
  )
}

export default ChooseChallengeResponse
