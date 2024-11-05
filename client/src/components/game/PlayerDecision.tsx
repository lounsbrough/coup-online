import { Typography } from "@mui/material"
import { canPlayerChooseAction, canPlayerChooseActionChallengeResponse, canPlayerChooseActionResponse, canPlayerChooseBlockChallengeResponse, canPlayerChooseBlockResponse } from '@shared'
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

  if (!gameState?.selfPlayer?.influences.length) {
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

  if (canPlayerChooseAction(gameState)) {
    return <ChooseAction />
  }

  if (canPlayerChooseActionResponse(gameState)) {
    return <ChooseActionResponse />
  }

  if (canPlayerChooseActionChallengeResponse(gameState)) {
    return <ChooseChallengeResponse />
  }

  if (gameState.pendingBlock && canPlayerChooseBlockResponse(gameState)) {
    return <ChooseBlockResponse />
  }

  if (canPlayerChooseBlockChallengeResponse(gameState)) {
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
