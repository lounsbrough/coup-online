import { Description, Gavel } from "@mui/icons-material"
import { Button, Grid } from "@mui/material"
import { Link as RouterLink } from "react-router"
import { useTranslationContext } from "../contexts/TranslationsContext"

function LegalLinks() {
  const { t } = useTranslationContext()

  return (
    <Grid container justifyContent='center' spacing={2} mt={8} mb={2}>
      <Grid>
        <Button
          color="primary"
          variant="outlined"
          startIcon={<Description />}
          component={RouterLink}
          to="/privacy-policy"
        >
          {t('privacyPolicy')}
        </Button>
      </Grid>
      <Grid>
        <Button
          color="primary"
          variant="outlined"
          startIcon={<Gavel />}
          component={RouterLink}
          to="/terms-of-service"
        >
          {t('termsOfService')}
        </Button>
      </Grid>
    </Grid>
  )
}

export default LegalLinks
