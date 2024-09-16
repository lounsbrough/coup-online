import { Button, Grid2, Typography } from "@mui/material"
import { ActionAttributes, Actions, InfluenceAttributes, Influences, ResponseAttributes, Responses } from "../../shared/types/game"
import { useState } from "react"
import { getPlayerId } from "../../helpers/playerId"
import { useGameStateContext } from "../../context/GameStateContext"
import { useColorModeContext } from "../../context/MaterialThemeContext"
import ColoredTypography from "../utilities/ColoredTypography"
import PlayerActionConfirmation from "./PlayerActionConfirmation"

function ChooseActionResponse() {
  const [selectedResponse, setSelectedResponse] = useState<Responses>()
  const [selectedInfluence, setSelectedInfluence] = useState<Influences>()
  const { gameState } = useGameStateContext()
  const { colorMode } = useColorModeContext()

  if (!gameState?.pendingAction) {
    return null
  }

  if (selectedResponse && (selectedResponse !== Responses.Block || selectedInfluence)) {
    return <PlayerActionConfirmation
      message={`${selectedResponse}${selectedInfluence ? ` as ${selectedInfluence}` : ''}`}
      endpoint="actionResponse"
      variables={{
        roomId: gameState.roomId,
        playerId: getPlayerId(),
        response: selectedResponse,
        claimedInfluence: selectedInfluence
      }}
      onCancel={() => {
        setSelectedResponse(undefined)
        setSelectedInfluence(undefined)
      }}
    />
  }

  return (
    <>
      {selectedResponse ? (
        <>
          <Typography sx={{ my: 1, fontWeight: 'bold' }}>
            Claim an Influence
          </Typography>
          <Grid2 container spacing={2} justifyContent="center">
            {Object.entries(InfluenceAttributes)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([influence, influenceAttributes]) => {
                if (influenceAttributes.legalBlock !== gameState.pendingAction?.action) {
                  return null
                }

                return <Button
                  key={influence}
                  onClick={() => {
                    setSelectedInfluence(influence as Influences)
                  }} sx={{ background: influenceAttributes.color[colorMode] }}
                  variant="contained"
                >{influence}</Button>
              })}
          </Grid2>
        </>
      ) : (
        <>
          <ColoredTypography sx={{ my: 1, fontWeight: 'bold' }}>
            {`${gameState.turnPlayer} is trying to use ${gameState.pendingAction.action}${gameState.pendingAction.targetPlayer
              ? ` on ${gameState.pendingAction.targetPlayer}`
              : ''}`}
          </ColoredTypography>
          <Grid2 container spacing={2} justifyContent="center">
            {Object.entries(ResponseAttributes)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([response, responseAttributes], index) => {
                if (response === Responses.Challenge &&
                  (!ActionAttributes[gameState.pendingAction?.action as Actions].challengeable
                    || gameState.pendingActionChallenge
                    || gameState.pendingAction?.claimConfirmed)) {
                  return null
                }

                if (response === Responses.Block &&
                  (!ActionAttributes[gameState.pendingAction?.action as Actions].blockable ||
                    (gameState.pendingAction?.targetPlayer &&
                      gameState.selfPlayer.name !== gameState.pendingAction?.targetPlayer
                    ))) {
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
      )}
    </>
  )
}

export default ChooseActionResponse
