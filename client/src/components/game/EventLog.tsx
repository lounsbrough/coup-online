import { Box, Grid2, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import { useGameStateContext } from "../../context/GameStateContext";
import GameTypography from "../utilities/GameTypography";

function EventLog() {
  const logBox = useRef<HTMLElement>(null);
  const { gameState } = useGameStateContext();

  useEffect(() => {
    logBox.current?.scrollTo({
      top: logBox.current.scrollHeight,
      behavior: "smooth",
    });
  }, [gameState?.eventLogs])

  if (!gameState) {
    return null;
  }

  return (
    <Grid2 justifyContent="flex-start" sx={{ textAlign: 'left' }}>
      <Typography sx={{ fontWeight: 700 }}>Event Log</Typography>
      <Box ref={logBox} sx={{ maxHeight: '10vh', minWidth: '15vw', overflowY: 'scroll' }}>
        {gameState.eventLogs.map((log, logIndex) =>
          <GameTypography key={logIndex}>{log}</GameTypography>
        )}
      </Box>
    </Grid2>
  )
}

export default EventLog;
