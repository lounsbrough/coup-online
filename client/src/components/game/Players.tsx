import { Box, Grid2, Typography } from "@mui/material"
import { colord } from 'colord'
import { useGameStateContext } from "../../contexts/GameStateContext"
import { MonetizationOn } from "@mui/icons-material"
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
            return (
              <Box
                key={index}
                sx={{
                  color: 'white',
                  alignContent: 'center',
                  background: color,
                  borderRadius: 3,
                  p: 0.5,
                  width: '6rem'
                }}>
                <Typography variant="h6" sx={{
                  fontWeight: 'bold',
                  color: colord(color).darken(0.4).toHex()
                }}
                >
                  <OverflowTooltip>{name}</OverflowTooltip>
                </Typography>
                <Typography variant="h6" sx={{ color: colord(color).darken(0.4).toHex() }}>
                  <MonetizationOn sx={{ verticalAlign: 'text-bottom' }} />{` ${coins}`}
                </Typography>
                <Grid2
                  container mt={0.5}
                  spacing={0.4}
                  justifyContent='center'
                >
                  {[
                    ...Array.from({ length: influenceCount }, () => undefined),
                    ...deadInfluences
                  ].map((influence, index) => {
                    return (
                      <Grid2
                        key={index}
                        sx={{
                          justifyContent: 'center',
                          alignContent: 'center',
                          height: '46px',
                          width: '46px',
                          background: colord(color).darken(0.25).toHex(),
                          padding: 0.5,
                          borderRadius: 2
                        }}>
                        <InfluenceIcon sx={{ fontSize: '32px', color: colord(color).lighten(0.2).toHex() }} influence={influence} />
                      </Grid2>
                    )
                  })}
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
