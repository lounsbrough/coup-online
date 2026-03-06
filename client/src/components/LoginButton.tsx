import { useState } from 'react'
import {
  Avatar,
  Button,
  ButtonProps,
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
import { useTranslationContext } from '../contexts/TranslationsContext'
import { Link as RouterLink } from 'react-router'

function LoginButton({ buttonProps }: Readonly<{ buttonProps?: ButtonProps }>) {
  const { user, signInWithGoogle, signInWithGitHub, signOut } = useAuthContext()
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

  if (user) {
    return (
      <>
        <Tooltip title={user.displayName || ''}>
          <IconButton onClick={handleMenuOpen} size="small">
            <Avatar
              {...(user.photoURL ? { src: user.photoURL } : {})}
              alt={user.displayName ?? ''}
              sx={{ width: 32, height: 32 }}
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
            await signInWithGoogle()
          } catch (error) {
            console.error('Google sign-in error:', error)
          }
          handleMenuClose()
        }}>
          <ListItemIcon><Google fontSize="small" /></ListItemIcon>
          <ListItemText>{t('signInWithGoogle')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={async () => {
          try {
            await signInWithGitHub()
          } catch (error) {
            console.error('GitHub sign-in error:', error)
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
