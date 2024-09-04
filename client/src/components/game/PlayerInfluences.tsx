import { Box, Grid2, Typography } from "@mui/material";
import { InfluenceAttributes, Player } from '../../shared/types/game'
import { Circle } from "@mui/icons-material";

function PlayerInfluences({ player }: { player: Player }) {
  if (!player.influences.length) {
    return null;
  }

  return (
    <>
      <Grid2 container justifyContent="center" spacing={2}>
        {player.influences.map((influence, index) =>
          <Box key={index} sx={{
            alignContent: 'center',
            background: 'lightgray',
            borderRadius: 3,
            p: 2,
            width: '8rem'
          }}>
            <Circle sx={{
              fontSize: '2rem',
              color: InfluenceAttributes[influence].color
            }} />
            <Typography sx={{
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}
            >{influence}
            </Typography>
          </Box>
        )}
      </Grid2>
    </>
  )
}

export default PlayerInfluences;
