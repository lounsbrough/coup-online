import { Box, Grid2, Typography, useTheme } from "@mui/material"
import PlayerInfluences from "../game/PlayerInfluences"
import Players from "../game/Players"
import EventLog from "./EventLog"
import RequestReset from "./RequestReset"
import PlayerDecision from "./PlayerDecision"
import SnarkyDeadComment from "./SnarkyDeadComment"
import Victory from "./Victory"
import PlayAgain from "./PlayAgain"
import { useGameStateContext } from "../../contexts/GameStateContext"

function GameBoard() {
  const { gameState } = useGameStateContext()
  const theme = useTheme()

  if (!gameState?.selfPlayer) {
    return null
  }

  const turnPlayer = gameState.players.find((player) =>
    player.name === gameState.turnPlayer
  )
  const playersLeft = gameState.players.filter(({ influenceCount }) => influenceCount)
  const gameIsOver = playersLeft.length === 1

  return (
    <Grid2 container>
      <Grid2 size={{ xs: 12, sm: 12, md: 0, lg: 3 }} />
      <Grid2
        p={2}
        size={{ xs: 12, sm: 12, md: 9, lg: 6 }}
      >
        {gameIsOver && (
          <Grid2 sx={{ m: 5 }}>
            <Victory player={playersLeft[0]} />
          </Grid2>
        )}
        {gameIsOver && (
          <Grid2 sx={{ m: 5 }}>
            <PlayAgain />
          </Grid2>
        )}
        {!gameState.selfPlayer.influences.length && (
          <Grid2>
            <SnarkyDeadComment />
          </Grid2>
        )}
        {turnPlayer && !gameIsOver && (
          <Box my={2}>
            <Typography component="span" variant="h4" sx={{
              fontWeight: 'bold', color: turnPlayer.color
            }}>{gameState.turnPlayer}</Typography>
            <Typography component="span" variant="h4">'s Turn</Typography>
          </Box>
        )}
        {!!gameState?.selfPlayer?.influences?.length && (
          <Grid2 container justifyContent="center" my={4}>
            <PlayerInfluences />
          </Grid2>
        )}
        <Grid2 container justifyContent="center" sx={{ my: 2 }}>
          <Players />
        </Grid2>
        {!gameIsOver && (
          <Grid2 container justifyContent="center">
            <Grid2 sx={{ p: 2 }}>
              <PlayerDecision />
            </Grid2>
          </Grid2>
        )}
      </Grid2>
      <Grid2
        size={{ xs: 12, sm: 12, md: 3 }}
        sx={{
          p: 2,
          textAlign: 'center',
          [theme.breakpoints.up('md')]: { textAlign: 'right' }
        }}
      >
        <EventLog />
        <RequestReset />
      </Grid2>
    </Grid2>
  )
}

export default GameBoard
