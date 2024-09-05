import { Box, Grid2, Typography } from "@mui/material";
import { useGameStateContext } from "../../context/GameStateContext";

function Players() {
  const { gameState } = useGameStateContext();

  if (!gameState) {
    return null;
  }

  return (
    <>
      <Grid2 container justifyContent="center" spacing={2}>
        {gameState.players
          .filter(({ influenceCount }) => influenceCount > 0)
          .map(({ name, color, coins, influenceCount }, index) => {
            const isSelf = gameState.selfPlayer.name === name;

            return (
              <Box
                key={index}
                sx={{
                  alignContent: 'center',
                  background: color,
                  borderRadius: 3,
                  borderStyle: isSelf ? 'solid' : undefined,
                  borderWidth: isSelf ? '3px' : undefined,
                  p: 2,
                  width: '8rem'
                }}>
                <Typography sx={{
                  fontWeight: 'bold',
                  fontSize: isSelf ? '1.8rem' : '1.5rem'
                }}
                >
                  {name}
                </Typography>
                <Typography sx={{ fontSize: isSelf ? '1.2rem' : '1rem' }}>{`Coins: ${coins}`}</Typography>
                <Typography sx={{ fontSize: isSelf ? '1.2rem' : '1rem' }}>{`Influences: ${influenceCount}`}</Typography>
              </Box>
            )
          }
          )}
      </Grid2>
    </>
  )
}

export default Players;
