import { Breadcrumbs, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import GameBoard from "../game/GameBoard";
import useSWR from "swr";
import { PublicGameState } from "../../shared/types/game";
import WaitingRoom from "../game/WaitingRoom";
import { getPlayerId } from "../../helpers/playerId";

async function fetcher<JSON>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Game not found, please return home')
    } else {
      throw new Error('Unknown error fetching game state')
    }
  }

  return res.json();
}

function Game() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roomId = searchParams.get('roomId');

  const { data: gameState, error } = useSWR<PublicGameState, Error>(
    `${process.env.REACT_API_BASE_URL ?? 'http://localhost:8000'}/gameState?roomId=${roomId}&playerId=${getPlayerId()}`,
    fetcher,
    { refreshInterval: 1000 }
  );

  if (!roomId) {
    navigate('/');
    return null;
  }

  return (
    <>
      <Breadcrumbs sx={{ m: 2 }} aria-label="breadcrumb">
        <Link to='/'>Home</Link>
        <Typography>Room {roomId}</Typography>
      </Breadcrumbs>
      {!!error && <Typography>{error.message}</Typography>}
      {!gameState && <Typography>Game state unavailable</Typography>}
      {gameState && !gameState.selfPlayer && (
        <Typography>You are not in this game</Typography>
      )}
      {gameState && gameState.isStarted && gameState.selfPlayer && (
        <GameBoard roomId={roomId} gameState={gameState} />
      )}
      {gameState && !gameState.isStarted && gameState.selfPlayer && (
        <WaitingRoom roomId={roomId} gameState={gameState} />
      )}
    </>
  )
}

export default Game;
