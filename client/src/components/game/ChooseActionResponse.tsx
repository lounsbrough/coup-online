import { Grid } from "@mui/material"
import { ActionAttributes, Actions, EventMessages, InfluenceAttributes, Influences, PlayerActions, Responses } from '@shared'
import { useState } from "react"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import PlayerActionConfirmation from "./PlayerActionConfirmation"
import CoupTypography from "../utilities/CoupTypography"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import GrowingButton from "../utilities/GrowingButton"
import getResponseIcon from "../../helpers/getResponseIcon"

function ChooseActionResponse() {
  const [selectedResponse, setSelectedResponse] = useState<Responses>()
  const [selectedInfluence, setSelectedInfluence] = useState<Influences>()
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()

  if (!gameState?.selfPlayer || !gameState?.pendingAction) {
    return null
  }

  if (selectedResponse && (selectedResponse !== Responses.Block || selectedInfluence)) {
    return <PlayerActionConfirmation
      message={selectedInfluence
        ? t('blockAsInfluence', {
          gameState,
          primaryInfluence: selectedInfluence
        })
        : t(selectedResponse)}
      action={PlayerActions.actionResponse}
      variables={{
        claimedInfluence: selectedInfluence,
        playerId: getPlayerId(),
        response: selectedResponse,
        roomId: gameState.roomId
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
        <CoupTypography
          my={1}
          variant="h6"
          fontWeight="bold"
          onBack={() => { setSelectedResponse(undefined) }}
          addTextShadow
        >
          {t('claimAnInfluence')}
        </CoupTypography>
        <Grid container spacing={2} justifyContent="center">
          {Object.entries(InfluenceAttributes)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([influence, influenceAttributes]) => {
              if (influenceAttributes.legalBlock !== gameState.pendingAction?.action) {
                return null
              }

              return <GrowingButton
                key={influence}
                onClick={() => {
                  setSelectedInfluence(influence as Influences)
                }}
                color={influence as Influences}
                variant="contained"
              >{t(influence as Influences)}</GrowingButton>
            })}
        </Grid>
      </>
    )
  }

  return (
    <>
      <CoupTypography variant="h6" sx={{ fontWeight: 'bold', my: 1 }} addTextShadow>
        {t(EventMessages.ActionPending, {
          action: gameState.pendingAction.action,
          gameState,
          primaryPlayer: gameState.turnPlayer!,
          secondaryPlayer: gameState.pendingAction.targetPlayer
        })}
      </CoupTypography>
      <Grid container spacing={2} justifyContent="center">
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

export default ChooseActionResponse
