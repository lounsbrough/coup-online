import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Slide from '@mui/material/Slide'
import { TransitionProps } from '@mui/material/transitions'
import ChatMessages from './ChatMessages'
import { useTranslationContext } from '../../contexts/TranslationsContext'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} appear />
})

interface ChatDialogProps {
  isOpen: boolean;
  handleClose: () => void;
}

export default function ChatDialog({
  isOpen, handleClose
}: ChatDialogProps) {
  const { t } = useTranslationContext()

  return (
    <React.Fragment>
      <Dialog
        open={isOpen}
        slots={{
          transition: Transition
        }}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{t('chat')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <ChatMessages />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={handleClose}>{t('close')}</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}
