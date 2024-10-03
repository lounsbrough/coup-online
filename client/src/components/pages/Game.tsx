import { Grid2, Link, Typography } from "@mui/material"
import GameBoard from "../game/GameBoard"
import WaitingRoom from "../game/WaitingRoom"
import { useGameStateContext } from "../../contexts/GameStateContext"

function Game() {
  const { gameState } = useGameStateContext()

  return (
    <>
      {gameState && !gameState.selfPlayer && (
        <Grid2 mt={2} container spacing={2} direction="column">
          <Grid2>
            <Typography>You are not in this game.</Typography>
          </Grid2>
          <Grid2>
            <Link href={`/join-game?roomId=${gameState.roomId}`}>Join Game</Link>
          </Grid2>
        </Grid2>
      )}
      {gameState && gameState.isStarted && gameState.selfPlayer && (
        <GameBoard />
      )}
      {gameState && !gameState.isStarted && gameState.selfPlayer && (
        <WaitingRoom />
      )}
    </>
  )
}

export default Game
