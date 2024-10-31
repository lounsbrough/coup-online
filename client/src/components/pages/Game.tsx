import { Button, Grid2, Typography } from "@mui/material"
import GameBoard from "../game/GameBoard"
import WaitingRoom from "../game/WaitingRoom"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useEffect } from "react"

const warnWhenLeavingGame = (event: BeforeUnloadEvent): void => {
  event.preventDefault()
}

function Game() {
  const { gameState } = useGameStateContext()
  const isPlayerAlive = gameState?.selfPlayer?.influences.length

  useEffect(() => {
    if (isPlayerAlive) {
      window.addEventListener("beforeunload", warnWhenLeavingGame)
    }

    return () => {
      window.removeEventListener("beforeunload", warnWhenLeavingGame)
    }
  }, [isPlayerAlive])

  return (
    <>
      {gameState && !gameState.selfPlayer && (
        <Grid2 mt={2} container spacing={2} direction="column">
          <Grid2>
            <Typography variant="h6" my={3}>You are not in this game.</Typography>
          </Grid2>
          <Grid2>
            <Button variant="contained" href={`/join-game?roomId=${gameState.roomId}`}>Join Game</Button>
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
