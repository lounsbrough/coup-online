import { useEffect } from 'react'
import { Box } from "@mui/material"
import { Google } from '@mui/icons-material'
import { PublicPlayer } from '@shared'
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import { useAuthContext } from '../../contexts/AuthContext'
import { useNotificationsContext } from '../../contexts/NotificationsContext'
import { loginNudgeLastShownStorageKey } from '../../helpers/localStorageKeys'
import CoupTypography from '../utilities/CoupTypography'

const oneWeekMs = 7 * 24 * 60 * 60 * 1000

function Victory({ player }: { player: PublicPlayer }) {
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()
  const { user, loading: authLoading, signInWithGoogle } = useAuthContext()
  const { showNotification } = useNotificationsContext()

  useEffect(() => {
    if (authLoading || user) return

    const lastShown = localStorage.getItem(loginNudgeLastShownStorageKey)
    if (lastShown && Date.now() - Number(lastShown) < oneWeekMs) return

    const setLoginNudgeShown = () => {
      localStorage.setItem(loginNudgeLastShownStorageKey, String(Date.now()))
    }

    showNotification({
      id: 'login-nudge',
      message: t('signInToTrackStats'),
      severity: 'info',
      eternal: true,
      onDismiss: setLoginNudgeShown,
      action: {
        label: t('signIn'),
        icon: <Google fontSize="small" />,
        onClick: () => { signInWithGoogle().catch(console.error) }
      }
    })
  }, [authLoading, user, showNotification, signInWithGoogle, t])

  return (
    <Box>
      <CoupTypography variant="h1" addTextShadow>
        {t('playerWins', {
          primaryPlayer: player.name,
          gameState
        })}
      </CoupTypography>
    </Box>
  )
}

export default Victory
