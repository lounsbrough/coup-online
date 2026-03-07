import { useState } from 'react'
import {
  Avatar,
  Button,
  ButtonProps,
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import { GitHub, Google, Login, Logout, Person } from '@mui/icons-material'
import { useAuthContext } from '../contexts/AuthContext'
import { useNotificationsContext } from '../contexts/NotificationsContext'
import { useTranslationContext } from '../contexts/TranslationsContext'
import { Link as RouterLink } from 'react-router'

function LoginButton({ buttonProps }: Readonly<{ buttonProps?: ButtonProps }>) {
  const { user, loading, signInWithGoogle, signInWithGitHub, signOut } = useAuthContext()
  const { showNotification } = useNotificationsContext()
  const { t } = useTranslationContext()
  const { isSmallScreen } = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  if (loading) {
    return (
      <IconButton disabled size="large">
        <CircularProgress size="1em" />
      </IconButton>
    )
  }

  if (user) {
    return (
      <>
        <Tooltip title={user.displayName || ''}>
          <IconButton onClick={handleMenuOpen} size="large">
            <Avatar
              {...(user.photoURL ? { src: user.photoURL } : {})}
              alt={user.displayName ?? ''}
              sx={{ width: '1.6em', height: '1.6em' }}
            >
              {user.displayName?.[0]?.toUpperCase() || <Person />}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'center', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        >
          <MenuItem disabled>
            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
              {user.displayName || user.email}
            </Typography>
          </MenuItem>
          <MenuItem
            component={RouterLink}
            to={`/profile/${user.uid}`}
            onClick={handleMenuClose}
          >
            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
            <ListItemText>{t('profile')}</ListItemText>
          </MenuItem>
          <MenuItem onClick={async () => {
            await signOut()
            handleMenuClose()
          }}>
            <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
            <ListItemText>{t('signOut')}</ListItemText>
          </MenuItem>
        </Menu>
      </>
    )
  }

  return (
    <>
      {isSmallScreen ? (
        <IconButton
          onClick={handleMenuOpen}
          {...buttonProps}
          color="primary"
        >
          <Login sx={{ fontSize: '2rem' }} />
        </IconButton>
      ) : (
        <Button
          startIcon={<Login />}
          onClick={handleMenuOpen}
          {...buttonProps}
        >
          {t('signIn')}
        </Button>
      )}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      >
        <MenuItem onClick={async () => {
          try {
            const { linked } = await signInWithGoogle()
            if (linked) {
              showNotification({ message: t('accountsLinkedSuccessfully'), severity: 'success' })
            }
          } catch (error) {
            console.error('Google sign-in error:', error)
            if ((error as { code?: string }).code === 'auth/account-exists-with-different-credential') {
              showNotification({ message: t('accountExistsSignInWithGitHub'), severity: 'warning' })
            }
          }
          handleMenuClose()
        }}>
          <ListItemIcon><Google fontSize="small" /></ListItemIcon>
          <ListItemText>{t('signInWithGoogle')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={async () => {
          try {
            const { linked } = await signInWithGitHub()
            if (linked) {
              showNotification({ message: t('accountsLinkedSuccessfully'), severity: 'success' })
            }
          } catch (error) {
            console.error('GitHub sign-in error:', error)
            if ((error as { code?: string }).code === 'auth/account-exists-with-different-credential') {
              showNotification({ message: t('accountExistsSignInWithGoogle'), severity: 'warning' })
            }
          }
          handleMenuClose()
        }}>
          <ListItemIcon><GitHub fontSize="small" /></ListItemIcon>
          <ListItemText>{t('signInWithGitHub')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

export default LoginButton
