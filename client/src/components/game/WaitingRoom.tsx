import { Button, Grid2, Snackbar, Typography, useTheme } from "@mui/material"
import Players from "../game/Players"
import { QRCodeSVG } from 'qrcode.react'
import { ContentCopy, InfoOutlined } from "@mui/icons-material"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useState } from "react"
import { LIGHT_COLOR_MODE } from "../../contexts/MaterialThemeContext"
import { PlayerActions } from "@shared"
import useGameMutation from "../../hooks/useGameMutation"
import Bot from "../icons/Bot"
import AddAiPlayer from "./AddAiPlayer"
import BetaTag from "../utilities/BetaTag"

function WaitingRoom() {
  const [showCopiedToClipboardMessage, setShowCopiedToClipboardMessage] = useState(false)
  const [addAiPlayerDialogOpen, setAddAiPlayerDialogOpen] = useState(false)
  const { gameState } = useGameStateContext()
  const theme = useTheme()

  const { trigger, isMutating, error } = useGameMutation<{
    roomId: string, playerId: string
  }>({ action: PlayerActions.startGame })

  if (!gameState) {
    return null
  }

  const inviteLink = `${window.location.origin}/join-game?roomId=${gameState.roomId}`

  return (
    <>
      <Grid2 container direction='column' justifyContent="center">
        <Grid2 sx={{ p: 2, mt: 4 }}>
          <Players inWaitingRoom />
        </Grid2>
      </Grid2>
      <Typography variant="h5" m={3}>Room: <strong>{gameState.roomId}</strong></Typography>
      <Grid2 container direction='column' spacing={2}>
        <Grid2>
          <QRCodeSVG
            bgColor="transparent"
            fgColor={theme.palette.primary[theme.palette.mode === LIGHT_COLOR_MODE ? 'dark' : 'light']}
            value={inviteLink}
          />
        </Grid2>
        <Grid2>
          <Button
            variant="contained"
            startIcon={<ContentCopy />}
            onClick={() => {
              navigator.clipboard.writeText(inviteLink)
              setShowCopiedToClipboardMessage(true)
            }}
          >
            Copy Invite Link
          </Button>
          <Snackbar
            open={showCopiedToClipboardMessage}
            autoHideDuration={5000}
            onClose={() => { setShowCopiedToClipboardMessage(false) }}
            message="Invite link copied"
          />
        </Grid2>
        <Grid2>
          <Button
            variant="contained"
            startIcon={<Bot />}
            onClick={() => {
              setAddAiPlayerDialogOpen(true)
            }}
            disabled={gameState.players.length === 6}
          >
            Add AI Player
            <BetaTag />
          </Button>
        </Grid2>
        <Grid2>
          <Button
            variant='contained'
            onClick={() => {
              trigger({
                roomId: gameState.roomId,
                playerId: getPlayerId()
              })
            }}
            disabled={gameState.players.length < 2 || isMutating}
          >
            Start Game
          </Button>
          {gameState.players.length < 2 && (
            <Typography sx={{ fontStyle: 'italic' }} mt={2}>
              Add at least one more player to start game
            </Typography>
          )}
          {gameState.players.length === 2 && (
            <Typography sx={{ fontStyle: 'italic' }} mt={2}>
              2 player game, starting player will begin with 1 coin
            </Typography>
          )}
          {error && <Typography color='error' sx={{ mt: 3, fontWeight: 700 }}>{error}</Typography>}
        </Grid2>
      </Grid2>
      <AddAiPlayer
        addAiPlayerDialogOpen={addAiPlayerDialogOpen}
        setAddAiPlayerDialogOpen={setAddAiPlayerDialogOpen}
      />
    </>
  )
}

export default WaitingRoom
