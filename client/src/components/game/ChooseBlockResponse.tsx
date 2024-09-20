import { Button, Grid2 } from "@mui/material"
import { ResponseAttributes, Responses } from "../../shared/types/game"
import { useState } from "react"
import { getPlayerId } from "../../helpers/playerId"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useColorModeContext } from "../../contexts/MaterialThemeContext"
import ColoredTypography from "../utilities/ColoredTypography"
import PlayerActionConfirmation from "./PlayerActionConfirmation"
import { getPresentProgressiveResponse } from "../../helpers/grammar"

function ChooseBlockResponse() {
  const [selectedResponse, setSelectedResponse] = useState<Responses>()
  const { gameState } = useGameStateContext()
  const { colorMode } = useColorModeContext()

  if (!gameState?.pendingBlock) {
    return null
  }

  if (selectedResponse) {
    return <PlayerActionConfirmation
      message={getPresentProgressiveResponse(selectedResponse)}
      endpoint="blockResponse"
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
      <ColoredTypography sx={{ my: 1, fontWeight: 'bold' }}>
        {`${gameState.pendingBlock.sourcePlayer} is trying to block ${gameState.turnPlayer} as ${gameState.pendingBlock.claimedInfluence}`}
      </ColoredTypography>
      <Grid2 container spacing={2} justifyContent="center">
        {Object.entries(ResponseAttributes)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([response, responseAttributes], index) => {
            if (response === Responses.Block) {
              return null
            }

            return <Button
              key={index}
              onClick={() => {
                setSelectedResponse(response as Responses)
              }}
              sx={{
                background: responseAttributes.color[colorMode]
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
