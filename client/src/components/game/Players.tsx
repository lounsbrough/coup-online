import { Box, Grid2, Typography } from "@mui/material";
import { useGameStateContext } from "../../context/GameStateContext";
import { Group, MonetizationOn } from "@mui/icons-material";

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

            let effectiveInfluenceCount = influenceCount;
            if (gameState.pendingInfluenceLoss[name]) {
              effectiveInfluenceCount -= gameState.pendingInfluenceLoss[name]
                .filter(({ putBackInDeck }) => putBackInDeck).length;
            }

            return (
              <Box
                key={index}
                sx={{
                  alignContent: 'center',
                  background: color,
                  borderRadius: 3,
                  borderStyle: isSelf ? 'solid' : undefined,
                  borderWidth: isSelf ? '3px' : undefined,
                  p: 1,
                  width: '8rem'
                }}>
                <Typography variant="h6" sx={{
                  fontWeight: 'bold'
                }}
                >
                  {name}
                </Typography>
                <Typography variant="h6" component="span"><MonetizationOn sx={{ verticalAlign: 'text-bottom' }} />{` ${coins}`}</Typography>
                <Typography variant="h6" ml={4} component="span"><Group sx={{ verticalAlign: 'text-bottom' }} />{` ${effectiveInfluenceCount}`}</Typography>
              </Box>
            )
          }
          )}
      </Grid2>
    </>
  )
}

export default Players;
