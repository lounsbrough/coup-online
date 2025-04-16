import { useState } from "react"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid2, IconButton, Switch, Typography, useTheme } from "@mui/material"
import { CancelOutlined, CheckCircle, Settings } from "@mui/icons-material"
import ColorModeToggle from "./ColorModeToggle"
import { confirmActionsStorageKey } from "../helpers/localStorageKeys"
import { useWebSocketContext } from "../contexts/WebSocketContext"
import { useSearchParams } from "react-router"
import LanguageSelector from "./LanguageSelector"
import { useTranslationContext } from "../contexts/TranslationsContext"

function UserSettings() {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [confirmActions, setConfirmActions] = useState<boolean>(
    JSON.parse(localStorage.getItem(confirmActionsStorageKey) ?? JSON.stringify(true))
  )
  const [searchParams] = useSearchParams()
  const { isConnected } = useWebSocketContext()
  const { t } = useTranslationContext()
  const { isSmallScreen } = useTheme()

  const roomId = searchParams.get('roomId')
  const rowHeight = 36

  return (
    <>
      {isSmallScreen ? (
        <IconButton
          color="primary"
          size="large"
          onClick={() => {
            setModalOpen(true)
          }}
        >
          <Settings sx={{ fontSize: '2rem' }} />
        </IconButton>
      ) : (
        <Button
          size="large"
          startIcon={<Settings />}
          onClick={() => {
            setModalOpen(true)
          }}
        >
          {t('settings')}
        </Button>
      )}
      <Dialog
        open={modalOpen}
        onClose={() => { setModalOpen(false) }}
      >
        <DialogTitle mb={2}>
          <Box display="flex" alignItems="center">
            <Typography flexGrow={1} textAlign="center" variant='h5'>
              <Settings sx={{ verticalAlign: 'middle', mr: 1 }} />
              <span style={{ verticalAlign: 'middle' }}>{t('settings')}</span>
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid2 container spacing={3} direction="column">
            <Grid2 height={rowHeight} alignContent="center" sx={{ whiteSpace: 'nowrap' }}>
              <Typography component="span" sx={{ mr: 2 }}>{t('language')}:</Typography>
              <LanguageSelector />
            </Grid2>
            {roomId && (
              <Grid2 height={rowHeight} alignContent="center">
                <Typography component="span" sx={{ mr: 1 }}>
                  {t('room')}
                  :
                </Typography>
                <strong>{roomId}</strong>
              </Grid2>
            )}
            <Grid2 height={rowHeight} alignContent="center">
              <Typography component="span" sx={{ mr: 2 }}>
                {t('colorMode')}
                :
              </Typography>
              <ColorModeToggle />
            </Grid2>
            <Grid2 height={rowHeight} alignContent="center">
              <Typography component="span">
                {t('confirmActions')}
                :
              </Typography>
              <Switch
                checked={confirmActions}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setConfirmActions(event.target.checked)
                  localStorage.setItem(confirmActionsStorageKey, JSON.stringify(event.target.checked))
                }}
                slotProps={{ input: { 'aria-label': 'controlled' } }}
              />
            </Grid2>
            <Grid2 height={rowHeight} alignContent="center">
              <Typography component="span" sx={{ mr: 1 }}>
                {t('websocketsConnection')}
                :
              </Typography>
              {isConnected
                ? <CheckCircle color="success" sx={{ verticalAlign: 'middle' }} />
                : <CancelOutlined color="error" sx={{ verticalAlign: 'middle' }} />}
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={() => { setModalOpen(false) }}>
            {t('close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default UserSettings
