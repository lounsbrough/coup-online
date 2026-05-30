import { useState } from "react"
import { Box, Button, Chip, Grid, Stack, useTheme } from "@mui/material"
import Players from "../game/Players"
import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle, ContentCopy, GroupAdd, PlayArrow } from "@mui/icons-material"
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
import CoupTypography from '../utilities/CoupTypography'

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
      <CoupTypography variant="h5" m={3} addTextShadow>
        {t('room')}
        : <strong>{gameState.roomId}</strong>
      </CoupTypography>
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
            <Box sx={{ fontStyle: 'italic' }}>
              {gameState.players.length < 2 && (
                <CoupTypography mt={2} addTextShadow>
                  {t('addPlayersToStartGame')}
                </CoupTypography>
              )}
              {gameState.players.length === 2 && (
                <CoupTypography mt={2} addTextShadow>
                  {t('startingPlayerBeginsWith1Coin')}
                </CoupTypography>
              )}
              {(gameState.settings.allowRevive || gameState.settings.enableReformation || gameState.settings.useInquisitor || gameState.settings.speedRoundSeconds) && (
                <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap mt={2}>
                  {gameState.settings.allowRevive && (
                    <Chip icon={<CheckCircle />} label={t('reviveIsEnabled')} color="success" size="small" />
                  )}
                  {gameState.settings.enableReformation && (
                    <Chip icon={<CheckCircle />} label={t('reformationIsEnabled')} color="success" size="small" />
                  )}
                  {gameState.settings.useInquisitor && (
                    <Chip icon={<CheckCircle />} label={t('inquisitorIsEnabled')} color="success" size="small" />
                  )}
                  {gameState.settings.speedRoundSeconds && (
                    <Chip icon={<CheckCircle />} label={`${t('speedRoundSeconds')}: ${gameState.settings.speedRoundSeconds}`} color="success" size="small" />
                  )}
                </Stack>
              )}
            </Box>
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
