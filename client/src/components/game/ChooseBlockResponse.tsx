import { Grid } from "@mui/material"
import { EventMessages, PlayerActions, Responses } from '@shared'
import { useState } from "react"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import PlayerActionConfirmation from "./PlayerActionConfirmation"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import GrowingButton from "../utilities/GrowingButton"
import getResponseIcon from "../../helpers/getResponseIcon"
import CoupTypography from '../utilities/CoupTypography'

function ChooseBlockResponse() {
  const [selectedResponse, setSelectedResponse] = useState<Responses>()
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  if (!gameState?.pendingBlock) {
    return null
  }

  if (selectedResponse) {
    return <PlayerActionConfirmation
      message={t(selectedResponse)}
      action={PlayerActions.blockResponse}
      variables={{
        playerId: getPlayerId(),
        response: selectedResponse,
        roomId: gameState.roomId
      }}
      onCancel={() => {
        setSelectedResponse(undefined)
      }}
    />
  }

  return (
    <>
      <CoupTypography variant="h6" sx={{ fontWeight: 'bold', my: 1 }} addTextShadow>
        {t(EventMessages.BlockPending, {
          gameState,
          primaryInfluence: gameState.pendingBlock.claimedInfluence,
          primaryPlayer: gameState.pendingBlock.sourcePlayer,
          secondaryPlayer: gameState.turnPlayer
        })}
      </CoupTypography>
      <Grid container spacing={2} justifyContent="center">
        {Object.values(Responses)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map((response, index) => {
            if (response === Responses.Block) {
              return null
            }

            const ResponseIcon = getResponseIcon(response)

            return <GrowingButton
              key={index}
              onClick={() => {
                setSelectedResponse(response as Responses)
              }} variant="contained"
              startIcon={<ResponseIcon />}
            >
              {t(response)}
            </GrowingButton>
          })}
      </Grid>
    </>
  )
}

export default ChooseBlockResponse
