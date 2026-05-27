import { Grid } from "@mui/material"
import { Influences, PlayerActions } from '@shared'
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import CoupTypography from "../utilities/CoupTypography"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import GrowingButton from "../utilities/GrowingButton"
import useGameMutation from "../../hooks/useGameMutation"

function ChooseExamineDecision() {
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()
  const { trigger, isMutating } = useGameMutation<{
    roomId: string, playerId: string, forceSwap: boolean
  }>({ action: PlayerActions.examineDecision })

  if (!gameState?.pendingExamine?.revealedInfluence) {
    return null
  }

  return (
    <>
      <CoupTypography variant="h6" sx={{ fontWeight: 'bold', my: 1 }} addTextShadow>
        {t('examineDecision', { primaryInfluence: gameState.pendingExamine.revealedInfluence as Influences })}
      </CoupTypography>
      <Grid container spacing={2} justifyContent="center" mt={2}>
        <GrowingButton
          disabled={isMutating}
          onClick={() => {
            trigger({
              roomId: gameState.roomId,
              playerId: getPlayerId(),
              forceSwap: true
            })
          }}
          variant="contained"
          color="error"
        >
          {t('forceSwap')}
        </GrowingButton>
        <GrowingButton
          disabled={isMutating}
          onClick={() => {
            trigger({
              roomId: gameState.roomId,
              playerId: getPlayerId(),
              forceSwap: false
            })
          }}
          variant="contained"
          color="success"
        >
          {t('allowKeep')}
        </GrowingButton>
      </Grid>
    </>
  )
}

export default ChooseExamineDecision
