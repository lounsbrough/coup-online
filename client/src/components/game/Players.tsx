import { Badge, Button, Grid2, Paper, Typography } from "@mui/material"
import { colord } from 'colord'
import { useGameStateContext } from "../../contexts/GameStateContext"
import { Close, MonetizationOn } from "@mui/icons-material"
import OverflowTooltip from "../utilities/OverflowTooltip"
import InfluenceIcon from "../icons/InfluenceIcon"
import { LIGHT_COLOR_MODE, useColorModeContext } from "../../contexts/MaterialThemeContext"
import { getPlayerId, getWaitingOnPlayers } from "../../helpers/players"
import { PlayerActions } from "@shared"
import useGameMutation from "../../hooks/useGameMutation"

function Players({ inWaitingRoom = false }: { inWaitingRoom?: boolean }) {
  const { gameState } = useGameStateContext()
  const { colorMode } = useColorModeContext()

  const { trigger, isMutating, error } = useGameMutation<{
    roomId: string, playerId: string, playerName: string
  }>({ action: PlayerActions.removeFromGame })

  if (!gameState) {
    return null
  }

  const colorModeFactor = colorMode === LIGHT_COLOR_MODE ? -1 : 1

  const waitingOnPlayers = getWaitingOnPlayers(gameState)

  return (
    <>
      <Grid2 container justifyContent="center" spacing={2}>
        {gameState.players
          .map(({ name, color, coins, influenceCount, deadInfluences }, index) => {
            const playerColor = influenceCount ? color : '#777777'
            const cardTextColor = colorMode === LIGHT_COLOR_MODE ? 'white' : 'black'

            return (
              <Badge
                key={index}
                invisible={!inWaitingRoom}
                badgeContent={
                  <Button
                    sx={{
                      p: 0,
                      height: '28px',
                      width: '28px',
                      minWidth: 'unset',
                      borderRadius: '28px',
                      background: color
                    }}
                    disabled={isMutating}
                    variant="contained"
                    onClick={() => {
                      trigger({
                        roomId: gameState.roomId,
                        playerId: getPlayerId(),
                        playerName: name
                      })
                    }}
                  >
                    <Close />
                  </Button>
                }
              >
                <Paper
                  sx={{
                    color: 'white',
                    alignContent: 'center',
                    background: playerColor,
                    borderRadius: 3,
                    p: 1,
                    width: '6rem',
                    outline: waitingOnPlayers.some(({ name: waitingOnName }) => waitingOnName === name)
                      ? `3px solid ${colord(playerColor).lighten(colorModeFactor * 0.1).toHex()}`
                      : undefined
                  }}>
                  <Typography variant="h6" sx={{
                    fontWeight: 'bold',
                    color: cardTextColor
                  }}
                  >
                    <OverflowTooltip>{name}</OverflowTooltip>
                  </Typography>
                  <Typography variant="h6" sx={{ color: cardTextColor }}>
                    <MonetizationOn sx={{ verticalAlign: 'text-bottom' }} />{` ${coins}`}
                  </Typography>
                  <Grid2
                    container mt={0.5}
                    spacing={1}
                    justifyContent='center'
                  >
                    {[
                      ...Array.from({ length: influenceCount }, () => undefined),
                      ...deadInfluences
                    ].map((influence, index) => {
                      return (
                        <Grid2
                          key={index}
                          sx={{
                            justifyContent: 'center',
                            alignContent: 'center',
                            height: '44px',
                            width: '44px',
                            background: colord(playerColor).darken(colorModeFactor * 0.25).toHex(),
                            padding: 0.5,
                            borderRadius: 2
                          }}>
                          <InfluenceIcon sx={{ fontSize: '32px', color: colord(playerColor).lighten(colorModeFactor * 0.2).toHex() }} influence={influence} />
                        </Grid2>
                      )
                    })}
                  </Grid2>
                </Paper>
              </Badge>
            )
          })}
      </Grid2>
      {error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{error}</Typography>}
    </>
  )
}

export default Players
