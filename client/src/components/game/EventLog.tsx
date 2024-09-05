import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import { useGameStateContext } from "../../context/GameStateContext";
import GameTypography from "../utilities/GameTypography";

function EventLog() {
  const logBox = useRef<HTMLElement>(null);
  const { gameState } = useGameStateContext();

  useEffect(() => {
    logBox.current?.scrollTo({
      top: logBox.current.scrollHeight,
      behavior: "smooth"
    });
  }, [gameState?.eventLogs?.length])

  if (!gameState) {
    return null;
  }

  return (
    <Box ref={logBox} sx={{ width: '100%', maxHeight: '15vh', overflowY: 'auto' }}>
      {gameState?.eventLogs.map((log, logIndex) =>
        <GameTypography key={logIndex}>{log}</GameTypography>
      )}
    </Box>
  )
}

export default EventLog;
