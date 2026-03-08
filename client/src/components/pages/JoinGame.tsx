import { useCallback, useState, useRef } from "react"
import { Analytics } from '@vercel/analytics/react'
import { Box, Button, Grid, TextField } from "@mui/material"
import { Person, Group, GroupAdd, Visibility } from "@mui/icons-material"
import { useNavigate, useSearchParams } from "react-router"
import { PlayerActions } from '@shared'
import { getPlayerId } from "../../helpers/players"
import useGameMutation from "../../hooks/useGameMutation"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import { useAuthContext } from '../../contexts/AuthContext'
import CoupTypography from '../utilities/CoupTypography'
import { useDisplayName } from '../../hooks/useDisplayName'

function JoinGame() {
  const [searchParams] = useSearchParams()
  const [roomId, setRoomId] = useState(searchParams.get('roomId') ?? '')
  const [playerName, setPlayerName] = useState('')
  const { displayName: profileName, loading: profileNameLoading } = useDisplayName()
  const navigate = useNavigate()
  const { t } = useTranslationContext()
  const { user } = useAuthContext()
  const formRef = useRef<HTMLFormElement>(null)
  const playerNameInputRef = useRef<HTMLInputElement>(null)

  const navigateToRoom = useCallback(() => {
    navigate(`/game?roomId=${roomId}`)
  }, [navigate, roomId])

  const { trigger: joinTrigger, isMutating: joinIsMutating } = useGameMutation<{
    roomId: string, playerId: string, playerName: string, uid?: string, photoURL?: string
  }>({ action: PlayerActions.joinGame, callback: navigateToRoom })

  const { trigger: spectateTrigger, isMutating: spectateIsMutating } = useGameMutation<{
    roomId: string, playerId: string
  }>({ action: PlayerActions.gameState, callback: navigateToRoom })

  return (
    <>
      <Analytics />
      <CoupTypography variant="h5" sx={{ m: 5 }} addTextShadow>
        {t('joinExistingGame')}
      </CoupTypography>
      <form
        ref={formRef}
        noValidate
        onSubmit={(event) => {
          event.preventDefault()

          const buttonId = event.nativeEvent.submitter?.id

          if (buttonId === 'joinGameButton') {
            playerNameInputRef.current!.setAttribute('required', '')
            if (formRef.current!.checkValidity()) joinTrigger({
              roomId: roomId.trim(),
              playerId: getPlayerId(),
              playerName: (profileName ?? playerName).trim(),
              ...(user && { uid: user.uid }),
              ...(user?.photoURL && { photoURL: user.photoURL }),
            })
          } else if (buttonId === 'spectateGameButton') {
            playerNameInputRef.current!.removeAttribute('required')
            if (formRef.current!.checkValidity()) spectateTrigger({
              roomId: roomId.trim(),
              playerId: getPlayerId()
            })
          } else {
            console.error('Unexpected button ID:', buttonId)
          }
          formRef.current!.reportValidity()
        }}
      >
        <Grid container direction="column" alignItems='center' spacing={2}>
          <Grid>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Group sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
              <TextField
                data-testid='roomIdInput'
                value={roomId}
                onChange={(event) => {
                  setRoomId(event.target.value.slice(0, 6).toUpperCase())
                }}
                label={t('room')}
                variant="standard"
                required
              />
            </Box>
          </Grid>
          <Grid>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 3 }}>
              <Person sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
              <TextField
                name="coup-game-player-name"
                autoComplete="off"
                slotProps={{
                  htmlInput: { ref: playerNameInputRef }
                }}
                data-testid='playerNameInput'
                value={profileName ?? playerName}
                onChange={(event) => {
                  if (!profileName) {
                    setPlayerName(event.target.value.slice(0, 10))
                  }
                }}
                label={!profileName && t('whatIsYourName')}
                variant="standard"
                required={!profileName}
                disabled={!!profileName || profileNameLoading}
                helperText={profileName ? t('nameFromProfile') : undefined}
              />
            </Box>
          </Grid>
          <Grid>
            <Button
              id="joinGameButton"
              type="submit"
              sx={{ mt: 5 }}
              variant="contained"
              loading={joinIsMutating}
              startIcon={<GroupAdd />}
            >
              {t('joinGame')}
            </Button>
          </Grid>
          <Grid>
            <Button
              id="spectateGameButton"
              type="submit"
              variant="contained"
              loading={spectateIsMutating}
              startIcon={<Visibility />}
            >
              {t('spectateGame')}
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  )
}

export default JoinGame
