import { Box, Grid2, Typography } from "@mui/material"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { MonetizationOn, QuestionMark } from "@mui/icons-material"
import OverflowTooltip from "../utilities/OverflowTooltip"
import InfluenceIcon from "../icons/InfluenceIcon"

function Players() {
  const { gameState } = useGameStateContext()

  if (!gameState) {
    return null
  }

  return (
    <>
      <Grid2 container justifyContent="center" spacing={2}>
        {gameState.players
          .map(({ name, color, coins, influenceCount, deadInfluences }, index) => {
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
                  <OverflowTooltip>{name}</OverflowTooltip>
                </Typography>
                <Typography variant="h6"><MonetizationOn sx={{ verticalAlign: 'text-bottom' }} />{` ${coins}`}</Typography>
                <Grid2
                  container mt={1}
                  spacing={1}
                  justifyContent='center'
                >
                  {[
                    ...Array.from({ length: influenceCount }, () => undefined),
                    ...deadInfluences
                  ].map((influence, index) => (
                    <Grid2 key={index}>
                      {influence ? <InfluenceIcon influence={influence} /> : <QuestionMark />}
                    </Grid2>
                  ))}
                </Grid2>
              </Box>
            )
          }
          )}
      </Grid2>
    </>
  )
}

export default Players
