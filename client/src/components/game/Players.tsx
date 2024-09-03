import { Box, Grid2, Typography } from "@mui/material";
import { PublicGameState } from '../../shared/types/game'

function Players({ gameState }: { gameState: PublicGameState }) {
  return (
    <>
      <Grid2 container justifyContent="center">
        {gameState.players.map(({ name, color, coins, influenceCount }, index) => {
          const isSelf = gameState.selfPlayer.name === name;

          return <Grid2 key={index}>
            <Box sx={{
              background: color,
              p: 2,
              border: isSelf ? '1px solid gray' : undefined,
              m: 1,
              borderRadius: 3
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
          </Grid2>;
        }
        )}
      </Grid2>
    </>
  )
}

export default Players;
