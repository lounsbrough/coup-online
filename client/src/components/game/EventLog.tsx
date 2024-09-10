import { Box, useMediaQuery } from "@mui/material";
import { useEffect, useRef } from "react";
import { useGameStateContext } from "../../context/GameStateContext";
import ColoredTypography from "../utilities/ColoredTypography";

function EventLog() {
  const logBox = useRef<HTMLElement>(null);
  const { gameState } = useGameStateContext();

  const isSmallScreen = useMediaQuery('screen and (max-width: 786px)');

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
    <Box ref={logBox} sx={{
      width: '100%',
      maxHeight: isSmallScreen ? '25dvh' : '85dvh',
      overflowY: 'auto'
    }}>
      {gameState?.eventLogs.map((log, logIndex) =>
        <ColoredTypography key={logIndex}>{log}</ColoredTypography>
      )}
    </Box>
  )
}

export default EventLog;
