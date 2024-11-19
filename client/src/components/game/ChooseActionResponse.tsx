import { Button, Grid2 } from "@mui/material"
import { ActionAttributes, Actions, InfluenceAttributes, Influences, PlayerActions, Responses, getActionMessage } from '@shared'
import { useState } from "react"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import ColoredTypography from "../utilities/ColoredTypography"
import PlayerActionConfirmation from "./PlayerActionConfirmation"
import TypographyWithBackButton from "../utilities/TypographyWithBackButton"

function ChooseActionResponse() {
  const [selectedResponse, setSelectedResponse] = useState<Responses>()
  const [selectedInfluence, setSelectedInfluence] = useState<Influences>()
  const { gameState } = useGameStateContext()

  if (!gameState?.selfPlayer || !gameState?.pendingAction) {
    return null
  }

  if (selectedResponse && (selectedResponse !== Responses.Block || selectedInfluence)) {
    return <PlayerActionConfirmation
      message={`${selectedResponse}${selectedInfluence ? ` as ${selectedInfluence}` : ''}`}
      action={PlayerActions.actionResponse}
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

  if (selectedResponse) {
    return (
      <>
        <TypographyWithBackButton
          my={1}
          variant="h6"
          fontWeight="bold"
          onBack={() => { setSelectedResponse(undefined) }}
        >
          Claim an Influence
        </TypographyWithBackButton>
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
                }}
                color={influence as Influences}
                variant="contained"
              >{influence}</Button>
            })}
        </Grid2>
      </>
    )
  }

  return (
    <>
      <ColoredTypography variant="h6" sx={{ my: 1, fontWeight: 'bold' }}>
        {getActionMessage({
          action: gameState.pendingAction.action,
          tense: 'pending',
          actionPlayer: gameState.turnPlayer!,
          targetPlayer: gameState.pendingAction.targetPlayer
        })}
      </ColoredTypography>
      <Grid2 container spacing={2} justifyContent="center">
        {Object.values(Responses)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map((response, index) => {
            if (response === Responses.Challenge &&
              (!ActionAttributes[gameState.pendingAction?.action as Actions].challengeable
                || gameState.pendingActionChallenge
                || gameState.pendingAction?.claimConfirmed)) {
              return null
            }

            if (response === Responses.Block &&
              (!ActionAttributes[gameState.pendingAction?.action as Actions].blockable ||
                (gameState.pendingAction?.targetPlayer &&
                  gameState.selfPlayer!.name !== gameState.pendingAction?.targetPlayer
                ))) {
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

export default ChooseActionResponse
