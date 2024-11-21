import { Button, Grid2 } from "@mui/material"
import { PlayerActions, Responses } from '@shared'
import { useState } from "react"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import ColoredTypography from "../utilities/ColoredTypography"
import PlayerActionConfirmation from "./PlayerActionConfirmation"
import { useTranslationContext } from "../../contexts/TranslationsContext"

function ChooseBlockResponse() {
  const [selectedResponse, setSelectedResponse] = useState<Responses>()
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  if (!gameState?.pendingBlock) {
    return null
  }

  if (selectedResponse) {
    return <PlayerActionConfirmation
      message={selectedResponse}
      action={PlayerActions.blockResponse}
      variables={{
        roomId: gameState.roomId,
        playerId: getPlayerId(),
        response: selectedResponse
      }}
      onCancel={() => {
        setSelectedResponse(undefined)
      }}
    />
  }

  return (
    <>
      <ColoredTypography variant="h6" sx={{ my: 1, fontWeight: 'bold' }}>
        {t('blockPending', {
          primaryPlayer: gameState.pendingBlock.sourcePlayer,
          secondaryPlayer: gameState.turnPlayer,
          influence: gameState.pendingBlock.claimedInfluence
        })}
      </ColoredTypography>
      <Grid2 container spacing={2} justifyContent="center">
        {Object.values(Responses)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map((response, index) => {
            if (response === Responses.Block) {
              return null
            }

            return <Button
              key={index}
              onClick={() => {
                setSelectedResponse(response as Responses)
              }} variant="contained"
            >
              {response}
            </Button>
          })}
      </Grid2>
    </>
  )
}

export default ChooseBlockResponse
