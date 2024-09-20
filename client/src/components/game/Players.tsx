import { Box, Grid2, Typography } from "@mui/material"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { Group, MonetizationOn } from "@mui/icons-material"

function Players() {
  const { gameState } = useGameStateContext()

  if (!gameState) {
    return null
  }

  return (
    <>
      <Grid2 container justifyContent="center" spacing={2}>
        {gameState.players
          .filter(({ influenceCount }) => influenceCount > 0)
          .map(({ name, color, coins, influenceCount }, index) => {
            const isSelf = gameState.selfPlayer.name === name

            return (
              <Box
                key={index}
                sx={{
                  color: 'white',
                  alignContent: 'center',
                  background: color,
                  borderRadius: 3,
                  borderStyle: isSelf ? 'solid' : undefined,
                  borderWidth: isSelf ? '3px' : undefined,
                  p: 1,
                  width: '6rem'
                }}>
                <Typography variant="h6" sx={{
                  fontWeight: 'bold'
                }}
                >
                  {name}
                </Typography>
                <Typography variant="h6"><MonetizationOn sx={{ verticalAlign: 'text-bottom' }} />{` ${coins}`}</Typography>
                <Typography variant="h6"><Group sx={{ verticalAlign: 'text-bottom' }} />{` ${influenceCount}`}</Typography>
              </Box>
            )
          }
          )}
      </Grid2>
    </>
  )
}

export default Players
