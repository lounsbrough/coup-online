import { Grid2 } from "@mui/material";
import PlayerInfluences from "../game/PlayerInfluences";
import { PublicGameState } from "../../../../shared/types/game";
import Players from "../game/Players";

function GameBoard({gameState} : {gameState: PublicGameState}) {
  return (
    <>
      <Grid2 container justifyContent="center">
        <Grid2 sx={{ background: 'lightGray', p: 2, borderRadius: 3 }}>
          <PlayerInfluences player={gameState.selfPlayer} />
        </Grid2>
      </Grid2>
      <Grid2 container justifyContent="center">
        <Grid2 sx={{ p: 2 }}>
          <Players players={gameState.players} />
        </Grid2>
      </Grid2>
    </>
  )
}

export default GameBoard;
