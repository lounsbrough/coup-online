import { useEffect } from "react";
import { Breadcrumbs, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPlayerId } from "../../helpers/playerId";
import { Link } from "react-router-dom";
import PlayerInfluences from "../game/PlayerInfluences";
import { PublicGameState } from "../../../../shared/types/game";
import useSWR from "swr";

async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init);
  return res.json();
}

function Game() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roomId = searchParams.get('roomId');

  const { data, error } = useSWR<PublicGameState, string>(
    `${process.env.REACT_API_BASE_URL ?? 'http://localhost:8000'}/gameState?roomId=${roomId}&playerId=${getPlayerId()}`,
    fetcher,
    { refreshInterval: 1000 }
  );

  if (!roomId) {
    navigate('/');
    return null;
  }

  if (!data) {
    return <Typography>Unable to determine game state {error}</Typography>
  }

  return (
    <>
      <Breadcrumbs sx={{ m: 2 }} aria-label="breadcrumb">
        <Link to='/'>Home</Link>
        <Typography>Room {roomId}</Typography>
      </Breadcrumbs>
      <PlayerInfluences player={data?.selfPlayer} />
    </>
  )
}

export default Game;
