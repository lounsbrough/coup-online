import { BugReport, GitHub, Lightbulb } from "@mui/icons-material"
import { Button, Grid2 } from "@mui/material"
import { useTranslationContext } from "../contexts/TranslationsContext"

const repoUrl = 'https://github.com/lounsbrough/coup-online'

function GitHubLinks() {
  const { t } = useTranslationContext()

  return (
    <Grid2 container justifyContent='center' spacing={2} m={10}>
      <Grid2>
        <Button href={repoUrl} variant="outlined" target="_blank" startIcon={<GitHub />}>
          GitHub
        </Button>
      </Grid2>
      <Grid2>
        <Button href={`${repoUrl}/issues/new?template=bug_report.md`} target="_blank" variant="outlined" startIcon={<BugReport />}>
          {t('reportBug')}
        </Button>
      </Grid2>
      <Grid2>
        <Button href={`${repoUrl}/issues/new?template=feature_request.md`} target="_blank" variant="outlined" startIcon={<Lightbulb />}>
          {t('requestFeature')}
        </Button>
      </Grid2>
    </Grid2>
  )
}

export default GitHubLinks
