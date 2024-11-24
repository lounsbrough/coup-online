import { Button, Grid2, Typography } from "@mui/material"
import { EventMessages, Influences, PlayerActions } from '@shared'
import { useState } from "react"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import PlayerActionConfirmation from "./PlayerActionConfirmation"
import { useTranslationContext } from "../../contexts/TranslationsContext"

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
        primaryInfluence: selectedInfluence,
        gameState
      })}
      action={gameState?.pendingActionChallenge ? PlayerActions.actionChallengeResponse : PlayerActions.blockChallengeResponse}
      variables={{
        roomId: gameState.roomId,
        playerId: getPlayerId(),
        influence: selectedInfluence
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
      <Typography variant="h6" sx={{ my: 1, fontWeight: 'bold' }}>
        {t(EventMessages.ChallengePending, {
          primaryPlayer: challengingPlayer,
          secondaryPlayer: challengedPlayer,
          gameState
        })}
      </Typography>
      <Typography variant="h6" sx={{ my: 1, fontWeight: 'bold' }}>
        {t('chooseInfluenceToReveal')}
      </Typography>
      {gameState.pendingBlock?.claimedInfluence && (
        <Typography variant="h6" sx={{ my: 1, fontWeight: 'bold' }}>
          {t('influenceWasClaimed', {
            primaryInfluence: gameState.pendingBlock?.claimedInfluence,
            gameState
          })}
        </Typography>
      )}
      <Grid2 container spacing={2} justifyContent="center">
        {gameState.selfPlayer.influences
          .sort((a, b) => a.localeCompare(b))
          .map((influence, index) => {
            return <Button
              key={index}
              onClick={() => {
                setSelectedInfluence(influence as Influences)
              }}
              color={influence as Influences}
              variant="contained"
            >
              {t(influence as Influences)}
            </Button>
          })}
      </Grid2>
    </>
  )
}

export default ChooseChallengeResponse
