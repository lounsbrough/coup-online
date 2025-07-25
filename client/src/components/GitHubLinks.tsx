import { BugReport, GitHub, Lightbulb } from "@mui/icons-material"
import { Button, Grid } from "@mui/material"
import { useTranslationContext } from "../contexts/TranslationsContext"

const repoUrl = 'https://github.com/lounsbrough/coup-online'

function GitHubLinks() {
  const { t } = useTranslationContext()

  return (
    <Grid container justifyContent='center' spacing={2} m={10}>
      <Grid>
        <Button href={repoUrl} color="secondary" variant="contained" target="_blank" startIcon={<GitHub />}>
          GitHub
        </Button>
      </Grid>
      <Grid>
        <Button href={`${repoUrl}/issues/new?template=bug_report.md`} target="_blank" color="secondary" variant="contained" startIcon={<BugReport />}>
          {t('reportBug')}
        </Button>
      </Grid>
      <Grid>
        <Button href={`${repoUrl}/issues/new?template=feature_request.md`} target="_blank" color="secondary" variant="contained" startIcon={<Lightbulb />}>
          {t('requestFeature')}
        </Button>
      </Grid>
    </Grid>
  )
}

export default GitHubLinks
