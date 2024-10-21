import { BugReport, GitHub, Lightbulb } from "@mui/icons-material"
import { Box, Button, Grid2 } from "@mui/material"

const repoUrl = 'https://github.com/lounsbrough/coup-online'

function Footer() {
  return (
    <Box sx={{ position: 'fixed', bottom: 0, width: '100%', py: 4 }}>
      <Grid2 container sx={{ width: '100%' }} justifyContent='center' spacing={2}>
        <Grid2>
          <Button href={repoUrl} variant="outlined" startIcon={<GitHub />}>GitHub</Button>
        </Grid2>
        <Grid2>
          <Button href={`${repoUrl}/issues/new?template=bug_report.md`} variant="outlined" startIcon={<BugReport />}>Report Bug</Button>
        </Grid2>
        <Grid2>
          <Button href={`${repoUrl}/issues/new?template=feature_request.md`} variant="outlined" startIcon={<Lightbulb />}>Request Feature</Button>
        </Grid2>
      </Grid2>
    </Box>
  )
}

export default Footer
