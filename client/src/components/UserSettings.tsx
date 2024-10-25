import { useState } from "react"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid2, Switch, Typography } from "@mui/material"
import { CancelOutlined, CheckCircle, Settings } from "@mui/icons-material"
import './Rules.css'
import ColorModeToggle from "./ColorModeToggle"
import { confirmActionsStorageKey } from "../helpers/localStorageKeys"
import { useWebSocketContext } from "../contexts/WebSocketContext"
import { useSearchParams } from "react-router-dom"

function UserSettings() {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [confirmActions, setConfirmActions] = useState<boolean>(
    JSON.parse(localStorage.getItem(confirmActionsStorageKey) ?? JSON.stringify(true))
  )
  const { isConnected } = useWebSocketContext()
  const [searchParams] = useSearchParams()

  const roomId = searchParams.get('roomId')

  const rowHeight = 36

  return (
    <>
      <Button
        size="large"
        startIcon={<Settings />}
        onClick={() => {
          setModalOpen(true)
        }}
      >
        Settings
      </Button>
      <Dialog
        open={modalOpen}
        onClose={() => { setModalOpen(false) }}
      >
        <DialogTitle mb={2}>Settings</DialogTitle>
        <DialogContent>
          <Grid2 container spacing={3} direction="column">
            {roomId && <Grid2>
              <Typography component="span" sx={{ mr: 1 }}>
                {'Room: '}<strong>{roomId}</strong>
              </Typography>
            </Grid2>}
            <Grid2 height={rowHeight}>
              <Typography component="span" sx={{ mr: 1 }}>Color Mode:</Typography>
              <ColorModeToggle />
            </Grid2>
            <Grid2 height={rowHeight}>
              <Typography component="span" sx={{ mr: 1 }}>Confirm Actions:</Typography>
              <Switch
                checked={confirmActions}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setConfirmActions(event.target.checked)
                  localStorage.setItem(confirmActionsStorageKey, JSON.stringify(event.target.checked))
                }}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            </Grid2>
            <Grid2 height={rowHeight} alignContent="center">
              {'WebSockets connection: '}
              {isConnected
                ? <CheckCircle color="success" sx={{ verticalAlign: 'middle' }} />
                : <CancelOutlined color="error" sx={{ verticalAlign: 'middle' }} />}
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={() => { setModalOpen(false) }}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default UserSettings
