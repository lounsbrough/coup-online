import { Box, Typography } from "@mui/material";
import { PublicPlayer } from "../../shared/types/game";

function Victory({ player }: { player: PublicPlayer }) {
  return (
    <Box sx={{ m: 5 }}>
      <Typography component="span" sx={{ fontSize: '48px', color: player.color }}>{player.name}</Typography>
      <Typography component="span" sx={{ fontSize: '48px' }}> Wins!</Typography>
    </Box>
  );
}

export default Victory;
