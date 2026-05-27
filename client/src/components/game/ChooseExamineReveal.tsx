import { Grid } from "@mui/material"
import { Influences, PlayerActions } from '@shared'
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import CoupTypography from "../utilities/CoupTypography"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import GrowingButton from "../utilities/GrowingButton"
import InfluenceIcon from "../icons/InfluenceIcon"
import useGameMutation from "../../hooks/useGameMutation"

function ChooseExamineReveal() {
    const { gameState } = useGameStateContext()
    const { t } = useTranslationContext()
    const { trigger, isMutating } = useGameMutation<{
        roomId: string, playerId: string, influence: string
    }>({ action: PlayerActions.revealForExamine })

    if (!gameState?.selfPlayer) {
        return null
    }

    return (
        <>
            <CoupTypography variant="h6" sx={{ fontWeight: 'bold', my: 1 }} addTextShadow>
                {t('chooseCardToReveal')}
            </CoupTypography>
            <Grid container spacing={2} justifyContent="center">
                {gameState.selfPlayer.influences.map((influence, index) => (
                    <GrowingButton
                        key={index}
                        disabled={isMutating}
                        onClick={() => {
                            trigger({
                                roomId: gameState.roomId,
                                playerId: getPlayerId(),
                                influence
                            })
                        }}
                        variant="contained"
                        startIcon={<InfluenceIcon influence={influence} />}
                    >
                        {t(influence as Influences)}
                    </GrowingButton>
                ))}
            </Grid>
        </>
    )
}

export default ChooseExamineReveal
