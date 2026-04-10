import { useMemo, useState } from "react"
import { Description, Gavel } from "@mui/icons-material"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from "@mui/material"
import { useTranslationContext } from "../contexts/TranslationsContext"

type ModalType = 'privacy' | 'terms' | null

function LegalLinks() {
  const { t } = useTranslationContext()
  const [modalType, setModalType] = useState<ModalType>(null)

  const modalTitle = useMemo(() => {
    if (modalType === 'privacy') {
      return t('privacyPolicy')
    }
    if (modalType === 'terms') {
      return t('termsOfService')
    }
    return ''
  }, [modalType, t])

  const modalBody = useMemo(() => {
    if (modalType === 'privacy') {
      return t('privacyPolicyContent')
    }
    if (modalType === 'terms') {
      return t('termsOfServiceContent')
    }
    return ''
  }, [modalType, t])

  return (
    <>
      <Grid container justifyContent='center' spacing={2} mt={8} mb={2}>
        <Grid>
          <Button color="primary" variant="outlined" startIcon={<Description />} onClick={() => { setModalType('privacy') }}>
            {t('privacyPolicy')}
          </Button>
        </Grid>
        <Grid>
          <Button color="primary" variant="outlined" startIcon={<Gavel />} onClick={() => { setModalType('terms') }}>
            {t('termsOfService')}
          </Button>
        </Grid>
      </Grid>
      <Dialog
        open={modalType !== null}
        onClose={() => { setModalType(null) }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{modalTitle}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ whiteSpace: 'pre-line' }}>
            <Typography variant="body2">{modalBody}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => { setModalType(null) }}>
            {t('close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default LegalLinks
