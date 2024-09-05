import { Box } from "@mui/material";
import { PublicPlayer } from "../../shared/types/game";
import GameTypography from "../utilities/GameTypography";

function Victory({ player }: { player: PublicPlayer }) {
  return (
    <Box>
      <GameTypography variant="h1">{`${player.name} Wins!`}</GameTypography>
    </Box>
  );
}

export default Victory;
