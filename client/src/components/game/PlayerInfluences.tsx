import { Box, Grid2, Typography } from "@mui/material";
import { InfluenceAttributes } from '../../shared/types/game'
import { Circle } from "@mui/icons-material";
import { useGameStateContext } from "../../context/GameStateContext";
import { useColorModeContext } from "../../context/MaterialThemeContext";

function PlayerInfluences() {
  const { gameState } = useGameStateContext();
  const { colorMode } = useColorModeContext();

  if (!gameState?.selfPlayer?.influences?.length) {
    return null;
  }

  return (
    <>
      <Grid2 container justifyContent="center" spacing={2}>
        {gameState.selfPlayer.influences.map((influence, index) =>
          <Box key={index} sx={{
            alignContent: 'center',
            background: 'rgba(120, 120, 120, 0.1)',
            borderRadius: 3,
            p: 2,
            width: '8rem'
          }}>
            <Circle sx={{
              fontSize: '2rem',
              color: InfluenceAttributes[influence].color[colorMode]
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
