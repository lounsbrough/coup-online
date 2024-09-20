import { Button, Grid2, Tooltip, Typography } from "@mui/material"
import { ActionAttributes, Actions } from '@shared/dist/types/game'
import { useState } from "react"
import { getPlayerId } from "../../helpers/playerId"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useColorModeContext } from "../../contexts/MaterialThemeContext"
import PlayerActionConfirmation from "./PlayerActionConfirmation"

function ChooseAction() {
  const [selectedAction, setSelectedAction] = useState<Actions>()
  const [selectedTargetPlayer, setSelectedTargetPlayer] = useState<string>()
  const { gameState } = useGameStateContext()
  const { colorMode } = useColorModeContext()

  if (!gameState) {
    return null
  }

  if (selectedAction && (!ActionAttributes[selectedAction].requiresTarget || selectedTargetPlayer)) {
    return <PlayerActionConfirmation
      message={`Using ${selectedAction}${selectedTargetPlayer ? ` on ${selectedTargetPlayer}` : ''}`}
      endpoint="action"
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
          <Typography sx={{ my: 1, fontWeight: 'bold' }}>
            Choose a Target
          </Typography>
          <Grid2 container spacing={2} justifyContent="center">
            {gameState.players.map((player) => {
              if (player.name === gameState.selfPlayer.name || !player.influenceCount
              ) {
                return null
              }
              return <Button
                key={player.name}
                onClick={() => {
                  setSelectedTargetPlayer(player.name)
                }} sx={{ background: player.color }}
                variant="contained"
              >{player.name}</Button>
            })}
          </Grid2>
        </>
      ) : (
        <>
          <Typography sx={{ my: 1, fontWeight: 'bold' }}>
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
                        sx={{
                          background: actionAttributes.color[colorMode]
                        }} variant="contained"
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
