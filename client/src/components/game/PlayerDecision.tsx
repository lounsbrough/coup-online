import { Typography } from "@mui/material";
import { PublicGameState } from "../../shared/types/game";
import ChooseAction from "./ChooseAction";
import ChooseActionResponse from "./ChooseActionResponse";

function PlayerDecision({ roomId, gameState }: {
  roomId: string, gameState: PublicGameState
}) {
  const turnPlayer = gameState.players.find((player) =>
    player.name === gameState.turnPlayer
  );

  if (turnPlayer?.name === gameState.selfPlayer.name &&
    !gameState.pendingAction &&
    !gameState.pendingActionChallenge &&
    !gameState.pendingBlock &&
    !gameState.pendingBlockChallenge &&
    !Object.keys(gameState.pendingInfluenceLossCount).length) {
    return <ChooseAction roomId={roomId} gameState={gameState} />;
  }

  if (turnPlayer?.name !== gameState.selfPlayer.name &&
    gameState.pendingAction &&
    !gameState.pendingActionChallenge &&
    gameState.pendingAction.pendingPlayers.includes(gameState.selfPlayer.name)) {
    return <ChooseActionResponse roomId={roomId} gameState={gameState} />;
  }

  return <Typography>Waiting for other players</Typography>;
}

export default PlayerDecision;
