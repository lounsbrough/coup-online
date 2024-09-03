import { Box, Grid2, Typography } from "@mui/material";
import { PublicGameState } from "../../shared/types/game";
import { useEffect, useRef } from "react";

function EventLog({ gameState }: { gameState: PublicGameState }) {
  const logBox = useRef<HTMLElement>(null);

  useEffect(() => {
    logBox.current?.scrollTo({
      top: logBox.current.scrollHeight,
      behavior: "smooth",
    });
  }, [gameState.eventLog.logs])

  return (
    <Grid2 justifyContent="flex-start" sx={{ textAlign: 'left' }}>
      <Typography sx={{ fontWeight: 700 }}>Event Log</Typography>
      <Box ref={logBox} sx={{ maxHeight: '10vh', minWidth: '15vw', overflowY: 'scroll' }}>
        {gameState.eventLog.logs.map((log, logIndex) => {
          const words = log.split(' ');
          return (
            <Typography variant="body1" key={logIndex}>
              {words.map((word, wordIndex) =>
                <Typography
                  component="span"
                  key={wordIndex}
                  sx={{ fontSize: '12px' }}
                  color={gameState.players.find((player) => player.name === word)?.color}
                >{word} </Typography>)}
            </Typography>
          );
        })}
      </Box>
    </Grid2>
  )
}

export default EventLog;
