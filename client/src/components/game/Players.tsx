import { Badge, Box, Button, Grid2, Typography } from "@mui/material"
import useSWRMutation from 'swr/mutation'
import { colord } from 'colord'
import { useGameStateContext } from "../../contexts/GameStateContext"
import { Close, MonetizationOn } from "@mui/icons-material"
import OverflowTooltip from "../utilities/OverflowTooltip"
import InfluenceIcon from "../icons/InfluenceIcon"
import { LIGHT_COLOR_MODE, useColorModeContext } from "../../contexts/MaterialThemeContext"
import { useState } from "react"
import { useWebSocketContext } from "../../contexts/WebSocketContext"
import { getPlayerId } from "../../helpers/playerId"
import { PlayerActions, ServerEvents } from "@shared"

type RemoveFromGameParams = { roomId: string, playerId: string, playerName: string }

function Players({ inWaitingRoom = false }: { inWaitingRoom?: boolean }) {
  const [error, setError] = useState('')
  const { gameState, setGameState } = useGameStateContext()
  const { colorMode } = useColorModeContext()
  const { socket } = useWebSocketContext()

  const { trigger: triggerSwr, isMutating } = useSWRMutation(`${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8008'}/${PlayerActions.removeFromGame}`, (async (url: string, { arg }: { arg: RemoveFromGameParams }) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(arg)
    }).then(async (res) => {
      if (res.ok) {
        setGameState(await res.json())
      } else {
        setError('Error starting new game')
      }
    })
  }))

  const trigger = socket?.connected
    ? (params: RemoveFromGameParams) => {
      socket.removeAllListeners(ServerEvents.error).on(ServerEvents.error, (error) => { setError(error) })
      socket.emit(PlayerActions.removeFromGame, params)
    }
    : triggerSwr

  if (!gameState) {
    return null
  }

  const colorModeFactor = colorMode === LIGHT_COLOR_MODE ? -1 : 1

  return (
    <>
      <Grid2 container justifyContent="center" spacing={2}>
        {gameState.players
          .map(({ name, color, coins, influenceCount, deadInfluences }, index) => {
            const playerColor = influenceCount ? color : '#777777'

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
                      borderRadius: '28px'
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
                <Box
                  sx={{
                    color: 'white',
                    alignContent: 'center',
                    background: playerColor,
                    borderRadius: 3,
                    p: 1,
                    width: '6rem'
                  }}>
                  <Typography variant="h6" sx={{
                    fontWeight: 'bold',
                    color: colord(playerColor).darken(colorModeFactor * 0.4).toHex()
                  }}
                  >
                    <OverflowTooltip>{name}</OverflowTooltip>
                  </Typography>
                  <Typography variant="h6" sx={{ color: colord(playerColor).darken(colorModeFactor * 0.4).toHex() }}>
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
                </Box>
              </Badge>
            )
          })}
      </Grid2>
      {error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{error}</Typography>}
    </>
  )
}

export default Players
