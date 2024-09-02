import { Box, Grid2, Typography } from "@mui/material";
import { PublicPlayer } from '../../shared/types/game'

function Players({ players } : { players: PublicPlayer[] }) {
  return (
    <>
      <Grid2 container justifyContent="center">
        {players.map(({ name, color, coins, influenceCount }, index) =>
          <Grid2 key={index}>
            <Box sx={{
              background: color,
              p: 2,
              m: 1,
              borderRadius: 3
            }}>
              <Typography sx={{
                fontWeight: 'bold',
                fontSize: '1.5rem'
              }}
              >{name}
              </Typography>
              <Typography>{`Coins: ${coins}`}</Typography>
              <Typography>{`Influences: ${influenceCount}`}</Typography>
            </Box>
          </Grid2>
        )}
      </Grid2>
    </>
  )
}

export default Players;
