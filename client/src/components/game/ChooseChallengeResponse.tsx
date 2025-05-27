import { Grid, Typography } from "@mui/material"
import { EventMessages, Influences, PlayerActions } from '@shared'
import { useState } from "react"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import PlayerActionConfirmation from "./PlayerActionConfirmation"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import GrowingButton from "../utilities/GrowingButton"

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
      <Typography variant="h6" sx={{ fontWeight: 'bold', my: 1 }}>
        {t(EventMessages.ChallengePending, {
          gameState,
          primaryPlayer: challengingPlayer,
          secondaryPlayer: challengedPlayer
        })}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 'bold', my: 1 }}>
        {t('chooseInfluenceToReveal')}
      </Typography>
      {gameState.pendingBlock?.claimedInfluence && (
        <Typography variant="h6" sx={{ fontWeight: 'bold', my: 1 }}>
          {t('influenceWasClaimed', {
            gameState,
            primaryInfluence: gameState.pendingBlock?.claimedInfluence
          })}
        </Typography>
      )}
      <Grid container spacing={2} justifyContent="center">
        {gameState.selfPlayer.influences
          .sort((a, b) => a.localeCompare(b))
          .map((influence, index) => {
            return <GrowingButton
              key={index}
              onClick={() => {
                setSelectedInfluence(influence as Influences)
              }}
              color={influence as Influences}
              variant="contained"
            >
              {t(influence as Influences)}
            </GrowingButton>
          })}
      </Grid>
    </>
  )
}

export default ChooseChallengeResponse
