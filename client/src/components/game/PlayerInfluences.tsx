import { Box, Grid2, Typography } from "@mui/material";
import { InfluenceAttributes } from '../../shared/types/game'
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
        {gameState.selfPlayer.influences
          .sort((a, b) => a.localeCompare(b))
          .map((influence, index) =>
            <Box key={index} sx={{
              alignContent: 'center',
              background: InfluenceAttributes[influence].color[colorMode],
              borderRadius: 3,
              p: 2,
              width: '8rem',
              height: '2rem'
            }}>
              <Typography sx={{
                fontWeight: 'bold',
                fontSize: '1.4rem'
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
