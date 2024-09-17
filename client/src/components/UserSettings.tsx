import { useState } from "react"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid2, Switch, Typography } from "@mui/material"
import { Settings } from "@mui/icons-material"
import './Rules.css'
import ColorModeToggle from "./ColorModeToggle"
import { confirmActionsStorageKey } from "../helpers/localStorageKeys"

function UserSettings() {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [confirmActions, setConfirmActions] = useState<boolean>(
    JSON.parse(localStorage.getItem(confirmActionsStorageKey) ?? JSON.stringify(true))
  )

  return (
    <>
      <Button
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
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <Grid2 container spacing={2} direction="column">
            <Grid2>
              <Typography component="span" sx={{ mr: 1 }}>Color Mode:</Typography>
              <ColorModeToggle />
            </Grid2>
            <Grid2>
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
