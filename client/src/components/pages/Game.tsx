import { Button, Grid2, Typography } from "@mui/material"
import GameBoard from "../game/GameBoard"
import WaitingRoom from "../game/WaitingRoom"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { Link } from "react-router-dom"

function Game() {
  const { gameState } = useGameStateContext()

  return (
    <>
      {gameState && !gameState.selfPlayer && (
        <Grid2 mt={2} container spacing={2} direction="column">
          <Grid2>
            <Typography variant="h6" my={3}>You are not in this game.</Typography>
          </Grid2>
          <Grid2>
            <Link to={`/join-game?roomId=${gameState.roomId}`}>
              <Button variant="contained">Join Game</Button>
            </Link>
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
