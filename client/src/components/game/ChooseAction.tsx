import { Box, Grid, Tooltip, Typography, useTheme } from "@mui/material"
import { ActionAttributes, Actions, PlayerActions, EventMessages } from '@shared'
import { useState } from "react"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import PlayerActionConfirmation from "./PlayerActionConfirmation"
import CoupTypography from "../utilities/CoupTypography"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import GrowingButton from "../utilities/GrowingButton"

function ChooseAction() {
  const [selectedAction, setSelectedAction] = useState<Actions>()
  const [selectedTargetPlayer, setSelectedTargetPlayer] = useState<string>()
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()
  const theme = useTheme()

  if (!gameState?.selfPlayer) {
    return null
  }

  if (selectedAction && (!ActionAttributes[selectedAction].requiresTarget || selectedTargetPlayer)) {
    return <PlayerActionConfirmation
      message={t(EventMessages.ActionConfirm, {
        action: selectedAction,
        gameState,
        secondaryPlayer: selectedTargetPlayer
      })}
      action={PlayerActions.action}
      variables={{
        action: selectedAction,
        playerId: getPlayerId(),
        roomId: gameState.roomId,
        targetPlayer: selectedTargetPlayer
      }}
      onCancel={() => {
        setSelectedAction(undefined)
        setSelectedTargetPlayer(undefined)
      }}
    />
  }

  if (selectedAction) {
    return (
      <>
        <CoupTypography
          my={1}
          variant="h6"
          fontWeight="bold"
          onBack={() => { setSelectedAction(undefined) }}
          addTextShadow
        >
          {t('chooseATarget')}
        </CoupTypography>
        <Grid container spacing={2} justifyContent="center">
          {gameState.players.map((player) => {
            if (player.name === gameState.selfPlayer?.name || !player.influenceCount
            ) {
              return null
            }

            const paletteColor = theme.palette.augmentColor({
              color: { main: player.color }
            })

            return <GrowingButton
              key={player.name}
              onClick={() => {
                setSelectedTargetPlayer(player.name)
              }}
              sx={{
                '&:hover': {
                  background: paletteColor.dark
                },
                background: paletteColor.main,
                color: paletteColor.contrastText
              }}
              variant="contained"
            >{player.name}</GrowingButton>
          })}
        </Grid>
      </>
    )
  }

  return (
    <>
      <CoupTypography variant="h6" sx={{ fontWeight: 'bold', my: 1 }} addTextShadow>
        {t('chooseAnAction')}
      </CoupTypography>
      <Grid container spacing={2} justifyContent="center">
        {Object.entries(ActionAttributes)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([action, actionAttributes], index) => {
            if (gameState.selfPlayer!.coins >= 10 && ![Actions.Coup, Actions.Revive].includes(action as Actions)) {
              return null
            }

            if (!gameState.settings.allowRevive && action === Actions.Revive) {
              return null
            }

            const lackingCoins = !!actionAttributes.coinsRequired && gameState.selfPlayer!.coins < actionAttributes.coinsRequired
            const noDeadInfluencesForRevive = action === Actions.Revive && !gameState.selfPlayer!.deadInfluences.length
            const isActionDisabled = lackingCoins || noDeadInfluencesForRevive

            return (
              <Grid key={index}>
                <Tooltip
                  title={isActionDisabled && (
                    <Box sx={{ textAlign: 'center' }}>
                      {lackingCoins && <Typography>{t('notEnoughCoins', { count: actionAttributes.coinsRequired })}</Typography>}
                      {noDeadInfluencesForRevive && <Typography>{t('noDeadInfluences')}</Typography>}
                    </Box>
                  )}
                  placement="top">
                  <span>
                    <GrowingButton
                      onClick={() => {
                        setSelectedAction(action as Actions)
                      }}
                      color={action as Actions}
                      variant="contained"
                      disabled={isActionDisabled}
                    >
                      {t(action as Actions)}
                    </GrowingButton>
                  </span>
                </Tooltip>
              </Grid>
            )
          })}
      </Grid>
    </>
  )
}

export default ChooseAction
