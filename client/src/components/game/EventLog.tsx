import { Box, Grid2, Typography } from "@mui/material";
import { ActionAttributes, Actions, InfluenceAttributes, Influences } from "../../shared/types/game";
import { useEffect, useRef } from "react";
import { useGameStateContext } from "../../context/GameStateContext";
import { useColorModeContext } from "../../context/MaterialThemeContext";

function EventLog() {
  const logBox = useRef<HTMLElement>(null);
  const { gameState } = useGameStateContext();
  const { colorMode } = useColorModeContext();

  useEffect(() => {
    logBox.current?.scrollTo({
      top: logBox.current.scrollHeight,
      behavior: "smooth",
    });
  }, [gameState?.eventLogs])

  if (!gameState) {
    return null;
  }

  const playerColors = Object.fromEntries(gameState.players.map((player) => [player.name, player.color]));

  return (
    <Grid2 justifyContent="flex-start" sx={{ textAlign: 'left' }}>
      <Typography sx={{ fontWeight: 700 }}>Event Log</Typography>
      <Box ref={logBox} sx={{ maxHeight: '10vh', minWidth: '15vw', overflowY: 'scroll' }}>
        {gameState.eventLogs.map((log, logIndex) => {
          const words = log.split(' ');
          return (
            <Typography variant="body1" key={logIndex}>
              {words.map((word, wordIndex) =>
                <Typography
                  component="span"
                  key={wordIndex}
                  sx={{
                    fontSize: playerColors[word] ||
                      InfluenceAttributes[word as Influences] ||
                      ActionAttributes[word as Actions] ? '14px' : '12px',
                    fontWeight: playerColors[word] ||
                      InfluenceAttributes[word as Influences] ||
                      ActionAttributes[word as Actions] ? '700' : undefined
                  }}
                  color={playerColors[word] ||
                    InfluenceAttributes[word as Influences]?.color[colorMode] ||
                    ActionAttributes[word as Actions]?.color[colorMode]
                  }
                >{word} </Typography>)}
            </Typography>
          );
        })}
      </Box>
    </Grid2>
  )
}

export default EventLog;
