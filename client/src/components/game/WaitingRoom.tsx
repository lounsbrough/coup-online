import { useState } from "react"
import { Button, Grid, Typography, useTheme } from "@mui/material"
import Players from "../game/Players"
import { QRCodeSVG } from 'qrcode.react'
import { ContentCopy, GroupAdd, PlayArrow } from "@mui/icons-material"
import { getPlayerId } from "../../helpers/players"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { LIGHT_COLOR_MODE } from "../../contexts/MaterialThemeContext"
import { MAX_PLAYER_COUNT, PlayerActions } from "@shared"
import useGameMutation from "../../hooks/useGameMutation"
import Bot from "../icons/Bot"
import AddAiPlayer from "./AddAiPlayer"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import { useNavigate } from "react-router"
import { useNotificationsContext } from "../../contexts/NotificationsContext"

function WaitingRoom() {
  const [addAiPlayerDialogOpen, setAddAiPlayerDialogOpen] = useState(false)
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()
  const theme = useTheme()
  const navigate = useNavigate()
  const { showNotification } = useNotificationsContext()

  const { trigger, isMutating } = useGameMutation<{
    roomId: string, playerId: string
  }>({ action: PlayerActions.startGame })

  if (!gameState) {
    return null
  }

  const inviteLink = `${window.location.origin}/join-game?roomId=${gameState.roomId}`

  return (
    <>
      <Grid container direction='column' justifyContent="center">
        <Grid sx={{ p: 2, mt: 4 }}>
          <Players inWaitingRoom />
        </Grid>
      </Grid>
      <Typography variant="h5" m={3}>
        {t('room')}
        : <strong>{gameState.roomId}</strong></Typography>
      <Grid container direction='column' spacing={2}>
        <Grid>
          <QRCodeSVG
            bgColor="transparent"
            fgColor={theme.palette.primary[theme.palette.mode === LIGHT_COLOR_MODE ? 'dark' : 'light']}
            value={inviteLink}
          />
        </Grid>
        <Grid>
          <Button
            variant="contained"
            startIcon={<ContentCopy />}
            onClick={() => {
              navigator.clipboard.writeText(inviteLink)
              showNotification({
                id: 'inviteLinkCopied',
                message: t('inviteLinkCopied'),
                severity: 'success'
              })
            }}
          >
            {(t('copyInviteLink'))}
          </Button>
        </Grid>
        {!!gameState.selfPlayer && (
          <Grid>
            <Button
              variant="contained"
              startIcon={<Bot />}
              onClick={() => {
                setAddAiPlayerDialogOpen(true)
              }}
              disabled={gameState.players.length === MAX_PLAYER_COUNT}
            >
              {(t('addAiPlayer'))}
            </Button>
          </Grid>
        )}
        {!!gameState.selfPlayer && (
          <Grid>
            <Button
              variant='contained'
              onClick={() => {
                trigger({
                  roomId: gameState.roomId,
                  playerId: getPlayerId()
                })
              }}
              disabled={gameState.players.length < 2}
              loading={isMutating}
              startIcon={<PlayArrow />}
            >
              {(t('startGame'))}
            </Button>
            {gameState.players.length < 2 && (
              <Typography sx={{ fontStyle: 'italic' }} mt={2}>
                {t('addPlayersToStartGame')}
              </Typography>
            )}
            {gameState.players.length === 2 && (
              <Typography sx={{ fontStyle: 'italic' }} mt={2}>
                {t('startingPlayerBeginsWith1Coin')}
              </Typography>
            )}
          </Grid>
        )}
        {!gameState.selfPlayer && (
          <Grid>
            <Button
              variant='contained'
              onClick={() => {
                navigate(`/join-game?roomId=${gameState.roomId}`)
              }}
              startIcon={<GroupAdd />}
            >
              {(t('joinGame'))}
            </Button>
          </Grid>
        )}
      </Grid>
      <AddAiPlayer
        addAiPlayerDialogOpen={addAiPlayerDialogOpen}
        setAddAiPlayerDialogOpen={setAddAiPlayerDialogOpen}
      />
    </>
  )
}

export default WaitingRoom
