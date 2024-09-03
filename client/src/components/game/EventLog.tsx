import { Box, Grid2, Typography } from "@mui/material";
import { InfluenceAttributes, Influences, PublicGameState } from "../../shared/types/game";
import { useEffect, useRef } from "react";

function EventLog({ gameState }: { gameState: PublicGameState }) {
  const logBox = useRef<HTMLElement>(null);

  useEffect(() => {
    logBox.current?.scrollTo({
      top: logBox.current.scrollHeight,
      behavior: "smooth",
    });
  }, [gameState.eventLogs])

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
                    fontSize: playerColors[word] || InfluenceAttributes[word as Influences] ? '14px' : '12px',
                    fontWeight: playerColors[word] || InfluenceAttributes[word as Influences] ? '700' : undefined
                  }}
                  color={playerColors[word] || InfluenceAttributes[word as Influences]?.color}
                >{word} </Typography>)}
            </Typography>
          );
        })}
      </Box>
    </Grid2>
  )
}

export default EventLog;
