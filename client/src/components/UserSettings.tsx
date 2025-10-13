import { useState } from "react"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Switch, Tooltip, Typography, useTheme } from "@mui/material"
import { CancelOutlined, CheckCircle, Feedback, Settings } from "@mui/icons-material"
import { useWebSocketContext } from "../contexts/WebSocketContext"
import { useSearchParams } from "react-router"
import LanguageSelector from "./LanguageSelector"
import { useTranslationContext } from "../contexts/TranslationsContext"
import { useUserSettingsContext } from "../contexts/UserSettingsContext"

function UserSettings() {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [searchParams] = useSearchParams()
  const { isConnected } = useWebSocketContext()
  const { t } = useTranslationContext()
  const { isSmallScreen } = useTheme()
  const { showChickens, confirmActions, setShowChickens, setConfirmActions } = useUserSettingsContext()

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
          <Grid container spacing={3} direction="column">
            <Grid height={rowHeight} alignContent="center" sx={{ whiteSpace: 'nowrap' }}>
              <Typography component="span" sx={{ mr: 2 }}>{t('language')}:</Typography>
              <LanguageSelector />
              <Tooltip title={t('reportIncorrectTranslation')}>
                <IconButton
                  sx={{ ml: 1 }}
                  href='https://github.com/lounsbrough/coup-online/issues/new?template=incorrect_translation.md'
                  target="_blank"
                >
                  <Feedback />
                </IconButton>
              </Tooltip>
            </Grid>
            {roomId && (
              <Grid height={rowHeight} alignContent="center">
                <Typography component="span" sx={{ mr: 1 }}>
                  {t('room')}
                  :
                </Typography>
                <strong>{roomId}</strong>
              </Grid>
            )}
            {/* <Grid height={rowHeight} alignContent="center">
              <Typography component="span" sx={{ mr: 2 }}>
                {t('colorMode')}
                :
              </Typography>
              <ColorModeToggle />
            </Grid> */}
            <Grid height={rowHeight} alignContent="center">
              <Typography component="span">
                {t('confirmActions')}
                :
              </Typography>
              <Switch
                checked={confirmActions}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setConfirmActions(event.target.checked)
                }}
                slotProps={{ input: { 'aria-label': 'controlled' } }}
              />
            </Grid>
            <Grid height={rowHeight} alignContent="center">
              <Typography component="span">
                {t('showChickens')} 🐓
                :
              </Typography>
              <Switch
                checked={showChickens}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setShowChickens(event.target.checked)
                }}
                slotProps={{ input: { 'aria-label': 'controlled' } }}
              />
            </Grid>
            <Grid height={rowHeight} alignContent="center">
              <Typography component="span" sx={{ mr: 1 }}>
                {t('websocketsConnection')}
                :
              </Typography>
              {isConnected
                ? <CheckCircle color="success" sx={{ verticalAlign: 'middle' }} />
                : <CancelOutlined color="error" sx={{ verticalAlign: 'middle' }} />}
            </Grid>
          </Grid>
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
