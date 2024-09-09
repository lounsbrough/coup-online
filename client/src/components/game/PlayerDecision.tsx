import { Typography } from "@mui/material"
import ChooseAction from "./ChooseAction"
import ChooseActionResponse from "./ChooseActionResponse"
import ChooseChallengeResponse from "./ChooseChallengeResponse"
import ChooseInfluenceToLose from "./ChooseInfluenceToLose"
import ChooseBlockResponse from "./ChooseBlockResponse"
import { useGameStateContext } from "../../context/GameStateContext"
import { Circle } from "@mui/icons-material"

function PlayerDecision() {
  const { gameState } = useGameStateContext()

  if (!gameState) {
    return null
  }

  const isMyTurn = gameState.turnPlayer === gameState.selfPlayer.name

  if (!gameState.selfPlayer.influences.length) {
    return null
  }

  if (gameState.pendingInfluenceLoss[gameState.selfPlayer.name]) {
    return <ChooseInfluenceToLose />
  }

  if (isMyTurn &&
    !gameState.pendingAction &&
    !gameState.pendingActionChallenge &&
    !gameState.pendingBlock &&
    !gameState.pendingBlockChallenge &&
    !Object.keys(gameState.pendingInfluenceLoss).length) {
    return <ChooseAction />
  }

  if (!isMyTurn &&
    gameState.pendingAction &&
    !gameState.pendingActionChallenge &&
    !gameState.pendingBlock &&
    gameState.pendingAction.pendingPlayers.includes(gameState.selfPlayer.name)) {
    return <ChooseActionResponse />
  }

  if (isMyTurn &&
    gameState.pendingActionChallenge) {
    return <ChooseChallengeResponse />
  }

  if (gameState.pendingBlock &&
    !gameState.pendingBlockChallenge &&
    gameState.selfPlayer.name !== gameState.pendingBlock.sourcePlayer &&
    gameState.pendingBlock.pendingPlayers.includes(gameState.selfPlayer.name)
  ) {
    return <ChooseBlockResponse />
  }

  if (
    gameState.pendingBlock &&
    gameState.pendingBlockChallenge &&
    gameState.pendingBlock.sourcePlayer === gameState.selfPlayer.name
  ) {
    return <ChooseChallengeResponse />
  }

  const waitingForColors = new Set<string>()
  if (!gameState.pendingAction) {
    waitingForColors.add(gameState.players.find(({ name }) => gameState.turnPlayer === name)!.color)
  } else if (gameState.pendingBlockChallenge) {
    waitingForColors.add(gameState.players.find(({ name }) => gameState.pendingBlock?.sourcePlayer === name)!.color)
  } else if (gameState.pendingBlock) {
    gameState.players
      .filter(({ name }) => gameState.pendingBlock?.pendingPlayers.includes(name))
      .forEach(({ color }) => waitingForColors.add(color))
  } else if (gameState.pendingActionChallenge) {
    waitingForColors.add(gameState.players.find(({ name }) => gameState.turnPlayer === name)!.color)
  } else if (gameState.pendingAction) {
    gameState.players
      .filter(({ name }) => gameState.pendingAction?.pendingPlayers.includes(name))
      .forEach(({ color }) => waitingForColors.add(color))
  }

  return (
    <>
      <Typography>Waiting for other players</Typography>
      <Typography>
        {[...waitingForColors].map((color) =>
          <Circle key={color} sx={{ color }} />
        )}
      </Typography>
    </>
  )
}

export default PlayerDecision
