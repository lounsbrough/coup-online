import { Typography } from "@mui/material"
import ChooseAction from "./ChooseAction"
import ChooseActionResponse from "./ChooseActionResponse"
import ChooseChallengeResponse from "./ChooseChallengeResponse"
import ChooseInfluenceToLose from "./ChooseInfluenceToLose"
import ChooseBlockResponse from "./ChooseBlockResponse"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { Circle } from "@mui/icons-material"
import ChooseInfluencesToKeep from "./ChooseInfluencesToKeep"
import { getWaitingOnPlayers } from "../../helpers/players"

function PlayerDecision() {
  const { gameState } = useGameStateContext()

  if (!gameState) {
    return null
  }

  const isMyTurn = gameState.turnPlayer === gameState.selfPlayer.name

  if (!gameState.selfPlayer.influences.length) {
    return null
  }

  const pendingInfluenceLoss = gameState.pendingInfluenceLoss[gameState.selfPlayer.name]
  if (pendingInfluenceLoss) {
    if (pendingInfluenceLoss[0].putBackInDeck) {
      return <ChooseInfluencesToKeep />
    } else {
      return <ChooseInfluenceToLose />
    }
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

  return (
    <>
      <Typography variant="h6" my={1} fontWeight="bold">Waiting for other players</Typography>
      <Typography>
        {getWaitingOnPlayers(gameState).map(({ color }) =>
          <Circle key={color} sx={{ color }} />
        )}
      </Typography>
    </>
  )
}

export default PlayerDecision
