import { Button, Grid2, Tooltip, Typography, useTheme } from "@mui/material"
import { ActionAttributes, Actions, PlayerActions, EventMessages } from '@shared'
import { useState } from "react"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import PlayerActionConfirmation from "./PlayerActionConfirmation"
import TypographyWithBackButton from "../utilities/TypographyWithBackButton"
import { useTranslationContext } from "../../contexts/TranslationsContext"

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
        secondaryPlayer: selectedTargetPlayer,
        gameState
      })}
      action={PlayerActions.action}
      variables={{
        roomId: gameState.roomId,
        playerId: getPlayerId(),
        action: selectedAction,
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
        <TypographyWithBackButton
          my={1}
          variant="h6"
          fontWeight="bold"
          onBack={() => { setSelectedAction(undefined) }}
        >
          {t('chooseATarget')}
        </TypographyWithBackButton>
        <Grid2 container spacing={2} justifyContent="center">
          {gameState.players.map((player) => {
            if (player.name === gameState.selfPlayer?.name || !player.influenceCount
            ) {
              return null
            }

            const paletteColor = theme.palette.augmentColor({
              color: { main: player.color }
            })

            return <Button
              key={player.name}
              onClick={() => {
                setSelectedTargetPlayer(player.name)
              }}
              sx={{
                color: paletteColor.contrastText,
                background: paletteColor.main,
                '&:hover': {
                  background: paletteColor.dark
                }
              }}
              variant="contained"
            >{player.name}</Button>
          })}
        </Grid2>
      </>
    )
  }

  return (
    <>
      <Typography variant="h6" sx={{ my: 1, fontWeight: 'bold' }}>
        {t('chooseAnAction')}
      </Typography>
      <Grid2 container spacing={2} justifyContent="center">
        {Object.entries(ActionAttributes)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([action, actionAttributes], index) => {
            const lackingCoins = !!actionAttributes.coinsRequired && gameState.selfPlayer!.coins < actionAttributes.coinsRequired

            if (gameState.selfPlayer!.coins >= 10 && action !== Actions.Coup) {
              return null
            }

            return (
              <Grid2 key={index}>
                <Tooltip title={lackingCoins && t('notEnoughCoins')}>
                  <span>
                    <Button
                      onClick={() => {
                        setSelectedAction(action as Actions)
                      }}
                      color={action as Actions}
                      variant="contained"
                      disabled={lackingCoins}
                    >
                      {t(action as Actions)}
                    </Button>
                  </span>
                </Tooltip>
              </Grid2>
            )
          })}
      </Grid2>
    </>
  )
}

export default ChooseAction
