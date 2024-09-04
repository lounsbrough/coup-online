import { Typography } from "@mui/material";
import { PublicGameState } from "../../shared/types/game";
import ChooseAction from "./ChooseAction";
import ChooseActionResponse from "./ChooseActionResponse";
import ChooseChallengeResponse from "./ChooseChallengeResponse";
import ChooseInfluenceToLose from "./ChooseInfluenceToLose";
import ChooseBlockResponse from "./ChooseBlockResponse";

function PlayerDecision({ roomId, gameState }: {
  roomId: string, gameState: PublicGameState
}) {
  const isMyTurn = gameState.turnPlayer === gameState.selfPlayer.name;

  if (!gameState.selfPlayer.influences.length) {
    return null;
  }

  if (gameState.pendingInfluenceLoss[gameState.selfPlayer.name]) {
    return <ChooseInfluenceToLose roomId={roomId} gameState={gameState} />
  }

  if (isMyTurn &&
    !gameState.pendingAction &&
    !gameState.pendingActionChallenge &&
    !gameState.pendingBlock &&
    !gameState.pendingBlockChallenge &&
    !Object.keys(gameState.pendingInfluenceLoss).length) {
    return <ChooseAction roomId={roomId} gameState={gameState} />;
  }

  if (!isMyTurn &&
    gameState.pendingAction &&
    !gameState.pendingActionChallenge &&
    gameState.pendingAction.pendingPlayers.includes(gameState.selfPlayer.name)) {
    return <ChooseActionResponse roomId={roomId} gameState={gameState} />;
  }

  if (isMyTurn &&
    gameState.pendingActionChallenge) {
    return <ChooseChallengeResponse roomId={roomId} gameState={gameState} />;
  }

  if (isMyTurn &&
    gameState.pendingBlock &&
    !gameState.pendingBlockChallenge
  ) {
    return <ChooseBlockResponse roomId={roomId} gameState={gameState} />;
  }

  if (
    gameState.pendingBlock &&
    gameState.pendingBlockChallenge &&
    gameState.pendingBlock.sourcePlayer === gameState.selfPlayer.name
  ) {
    return <ChooseChallengeResponse roomId={roomId} gameState={gameState} />;
  }

  return <Typography>Waiting for other players</Typography>;
}

export default PlayerDecision;
