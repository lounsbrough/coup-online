import { Button, Grid2, Typography } from "@mui/material"
import { InfluenceAttributes, Influences } from '@shared/dist/types/game'
import { useState } from "react"
import { getPlayerId } from "../../helpers/playerId"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useColorModeContext } from "../../contexts/MaterialThemeContext"
import ColoredTypography from "../utilities/ColoredTypography"
import PlayerActionConfirmation from "./PlayerActionConfirmation"

function ChooseChallengeResponse() {
  const [selectedInfluence, setSelectedInfluence] = useState<Influences>()
  const { gameState } = useGameStateContext()
  const { colorMode } = useColorModeContext()

  if (!gameState?.pendingActionChallenge && !gameState?.pendingBlockChallenge) {
    return null
  }

  if (selectedInfluence) {
    return <PlayerActionConfirmation
      message={`Revealing ${selectedInfluence}`}
      endpoint={gameState?.pendingActionChallenge ? 'actionChallengeResponse' : 'blockChallengeResponse'}
      variables={{
        roomId: gameState.roomId,
        playerId: getPlayerId(),
        influence: selectedInfluence
      }}
      onCancel={() => {
        setSelectedInfluence(undefined)
      }}
    />
  }

  const challengingPlayer = gameState.pendingBlockChallenge?.sourcePlayer || gameState.pendingActionChallenge?.sourcePlayer
  const challengedPlayer = gameState.pendingBlock?.sourcePlayer || gameState.turnPlayer

  return (
    <>
      <ColoredTypography sx={{ my: 1, fontWeight: 'bold' }}>
        {`${challengingPlayer} is challenging ${challengedPlayer}`}
      </ColoredTypography>
      <Typography sx={{ my: 1, fontWeight: 'bold' }}>
        Choose an Influence to Reveal
      </Typography>
      {gameState.pendingBlock?.claimedInfluence && (
        <ColoredTypography sx={{ my: 1, fontWeight: 'bold' }}>
          {`${gameState.pendingBlock?.claimedInfluence} was claimed`}
        </ColoredTypography>
      )}
      <Grid2 container spacing={2} justifyContent="center">
        {gameState.selfPlayer.influences
          .sort((a, b) => a.localeCompare(b))
          .map((influence, index) => {
            return <Button
              key={index}
              onClick={() => {
                setSelectedInfluence(influence as Influences)
              }}
              sx={{
                background: InfluenceAttributes[influence].color[colorMode]
              }} variant="contained"
            >
              {influence}
            </Button>
          })}
      </Grid2>
    </>
  )
}

export default ChooseChallengeResponse
