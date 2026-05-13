import { Box } from '@mui/material'
import CoupTypography from '../utilities/CoupTypography'
import { useTranslationContext } from '../../contexts/TranslationsContext'

const CONTACT_EMAIL = 'david.lounsbrough@gmail.com'

function TermsOfService() {
  const { t } = useTranslationContext()

  return (
    <Box sx={{ mx: 'auto', maxWidth: 900, px: 3, py: 2, textAlign: 'left' }}>
      <CoupTypography variant="h4" sx={{ mb: 3 }} addTextShadow>
        {t('termsOfService')}
      </CoupTypography>
      <CoupTypography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
        {t('termsOfServiceContent', { textVars: { contactEmail: CONTACT_EMAIL } })}
      </CoupTypography>
    </Box>
  )
}

export default TermsOfService
