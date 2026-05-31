import { Box } from '@mui/material'
import { canPlayerChooseAction, canPlayerChooseActionChallengeResponse, canPlayerChooseActionResponse, canPlayerChooseBlockChallengeResponse, canPlayerChooseBlockResponse, canPlayerMakeExamineDecision, canPlayerRevealForExamine } from '@shared'
import ChooseAction from "./ChooseAction"
import ChooseActionResponse from "./ChooseActionResponse"
import ChooseChallengeResponse from "./ChooseChallengeResponse"
import ChooseInfluenceToLose from "./ChooseInfluenceToLose"
import ChooseBlockResponse from "./ChooseBlockResponse"
import { useGameStateContext } from "../../contexts/GameStateContext"
import ChooseInfluencesToKeep from "./ChooseInfluencesToKeep"
import WaitingOnOtherPlayers from "./WaitingOnOtherPlayers"
import SpeedRoundTimer from './SpeedRoundTimer'
import ChooseExamineReveal from './ChooseExamineReveal'
import ChooseExamineDecision from './ChooseExamineDecision'

function PlayerDecision() {
  const { gameState } = useGameStateContext()

  if (!gameState?.selfPlayer?.influences.length) {
    return null
  }

  let decision: React.ReactNode = null

  const pendingInfluenceLoss = gameState.pendingInfluenceLoss[gameState.selfPlayer.name]
  if (pendingInfluenceLoss) {
    decision = pendingInfluenceLoss[0].putBackInDeck ? <ChooseInfluencesToKeep /> : <ChooseInfluenceToLose />
  } else if (canPlayerChooseAction(gameState)) {
    decision = <ChooseAction />
  } else if (canPlayerChooseActionResponse(gameState)) {
    decision = <ChooseActionResponse />
  } else if (canPlayerChooseActionChallengeResponse(gameState)) {
    decision = <ChooseChallengeResponse />
  } else if (gameState.pendingBlock && canPlayerChooseBlockResponse(gameState)) {
    decision = <ChooseBlockResponse />
  } else if (canPlayerChooseBlockChallengeResponse(gameState)) {
    decision = <ChooseChallengeResponse />
  } else if (canPlayerRevealForExamine(gameState)) {
    decision = <ChooseExamineReveal />
  } else if (canPlayerMakeExamineDecision(gameState)) {
    decision = <ChooseExamineDecision />
  }

  if (decision) {
    return (
      <>
        {decision}
        <Box sx={{ mt: 3 }}>
          <SpeedRoundTimer />
        </Box>
      </>
    )
  }

  return (
    <WaitingOnOtherPlayers />
  )
}

export default PlayerDecision
