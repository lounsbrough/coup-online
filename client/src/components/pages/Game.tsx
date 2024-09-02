import { Breadcrumbs, Grid2, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSWR from "swr";
import { Link } from "react-router-dom";
import { getPlayerId } from "../../helpers/playerId";
import PlayerInfluences from "../game/PlayerInfluences";
import { PublicGameState } from "../../../../shared/types/game";
import Players from "../game/Players";

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

  const { data, error } = useSWR<PublicGameState, Error>(
    `${process.env.REACT_API_BASE_URL ?? 'http://localhost:8000'}/gameState?roomId=${roomId}&playerId=${getPlayerId()}`,
    fetcher,
    { refreshInterval: 1000 }
  );

  if (!roomId) {
    navigate('/');
    return null;
  }

  if (error) {
    return <Typography>{error.message}</Typography>
  }

  if (!data) {
    return <Typography>Game state unavailable</Typography>
  }

  return (
    <>
      <Breadcrumbs sx={{ m: 2 }} aria-label="breadcrumb">
        <Link to='/'>Home</Link>
        <Typography>Room {roomId}</Typography>
      </Breadcrumbs>
      <Grid2 container justifyContent="center">
        <Grid2 sx={{ background: 'lightGray', p: 2, borderRadius: 3 }}>
          <PlayerInfluences player={data.selfPlayer} />
        </Grid2>
      </Grid2>
      <Grid2 container justifyContent="center">
        <Grid2 sx={{ p: 2 }}>
          <Players players={data.players} />
        </Grid2>
      </Grid2>
    </>
  )
}

export default Game;
