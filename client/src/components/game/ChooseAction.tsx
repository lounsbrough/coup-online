import { Button, Grid2, Tooltip, Typography, useTheme } from "@mui/material"
import { ActionAttributes, Actions, getActionMessage, PlayerActions } from '@shared'
import { useState } from "react"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import PlayerActionConfirmation from "./PlayerActionConfirmation"

function ChooseAction() {
  const [selectedAction, setSelectedAction] = useState<Actions>()
  const [selectedTargetPlayer, setSelectedTargetPlayer] = useState<string>()
  const { gameState } = useGameStateContext()
  const theme = useTheme()

  if (!gameState) {
    return null
  }

  if (selectedAction && (!ActionAttributes[selectedAction].requiresTarget || selectedTargetPlayer)) {
    return <PlayerActionConfirmation
      message={getActionMessage({
        action: selectedAction,
        tense: 'confirm',
        actionPlayer: gameState.turnPlayer!,
        targetPlayer: selectedTargetPlayer
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

  return (
    <>
      {selectedAction ? (
        <>
          <Typography variant="h6" sx={{ my: 1, fontWeight: 'bold' }}>
            Choose a Target
          </Typography>
          <Grid2 container spacing={2} justifyContent="center">
            {gameState.players.map((player) => {
              if (player.name === gameState.selfPlayer.name || !player.influenceCount
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
      ) : (
        <>
          <Typography variant="h6" sx={{ my: 1, fontWeight: 'bold' }}>
            Choose an Action
          </Typography>
          <Grid2 container spacing={2} justifyContent="center">
            {Object.entries(ActionAttributes)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([action, actionAttributes], index) => {
                const lackingCoins = !!actionAttributes.coinsRequired && gameState.selfPlayer.coins < actionAttributes.coinsRequired

                if (gameState.selfPlayer.coins >= 10 && action !== Actions.Coup) {
                  return null
                }

                return (
                  <Grid2 key={index}>
                    {lackingCoins ? (
                      <Tooltip title="Not enough coins">
                        <span>
                          <Button
                            variant="contained"
                            disabled
                          >
                            {action}
                          </Button>
                        </span>
                      </Tooltip>
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedAction(action as Actions)
                        }}
                        color={action as Actions}
                        variant="contained"
                      >
                        {action}
                      </Button>
                    )}
                  </Grid2>
                )
              })}
          </Grid2>
        </>
      )}
    </>
  )
}

export default ChooseAction
