import { Typography } from "@mui/material";
import ChooseAction from "./ChooseAction";
import ChooseActionResponse from "./ChooseActionResponse";
import ChooseChallengeResponse from "./ChooseChallengeResponse";
import ChooseInfluenceToLose from "./ChooseInfluenceToLose";
import ChooseBlockResponse from "./ChooseBlockResponse";
import { useGameStateContext } from "../../context/GameStateContext";

function PlayerDecision() {
  const { gameState } = useGameStateContext();

  if (!gameState) {
    return null;
  }

  const isMyTurn = gameState.turnPlayer === gameState.selfPlayer.name;

  if (!gameState.selfPlayer.influences.length) {
    return null;
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
    return <ChooseAction />;
  }

  if (!isMyTurn &&
    gameState.pendingAction &&
    !gameState.pendingActionChallenge &&
    !gameState.pendingBlock &&
    gameState.pendingAction.pendingPlayers.includes(gameState.selfPlayer.name)) {
    return <ChooseActionResponse />;
  }

  if (isMyTurn &&
    gameState.pendingActionChallenge) {
    return <ChooseChallengeResponse />;
  }

  if (isMyTurn &&
    gameState.pendingBlock &&
    !gameState.pendingBlockChallenge
  ) {
    return <ChooseBlockResponse />;
  }

  if (
    gameState.pendingBlock &&
    gameState.pendingBlockChallenge &&
    gameState.pendingBlock.sourcePlayer === gameState.selfPlayer.name
  ) {
    return <ChooseChallengeResponse />;
  }

  return <Typography>Waiting for other players</Typography>;
}

export default PlayerDecision;
