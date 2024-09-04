import { Typography } from "@mui/material";
import { Player } from "../../shared/types/game";

function InfluenceCard({ player }: { player: Player }) {
  return <Typography>{JSON.stringify(player)}</Typography>
}

export default InfluenceCard;
