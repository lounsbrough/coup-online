import { Box, Typography } from "@mui/material";
import { useEffect, useMemo, useRef } from "react";
import { useGameStateContext } from "../../context/GameStateContext";
import GameTypography from "../utilities/GameTypography";

function EventLog() {
  const logBox = useRef<HTMLElement>(null);
  const { gameState } = useGameStateContext();

  useEffect(() => {
    logBox.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [gameState?.eventLogs?.length])

  const reversedLogs = useMemo(() => [...gameState?.eventLogs ?? []].reverse(), [gameState?.eventLogs]);

  if (!gameState) {
    return null;
  }

  return (
    <Box ref={logBox} sx={{ maxHeight: '75vh', width: '100%', overflowY: 'scroll' }}>
      {reversedLogs.map((log, logIndex) =>
        <GameTypography key={logIndex}>{log}</GameTypography>
      )}
    </Box>
  )
}

export default EventLog;
