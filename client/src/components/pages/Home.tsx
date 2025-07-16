import { Button, Grid, Typography } from "@mui/material"
import { useNavigate } from "react-router"
import GitHubLinks from "../GitHubLinks"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import { AddCircle, GroupAdd } from "@mui/icons-material"

function Home() {
  const navigate = useNavigate()
  const { t } = useTranslationContext()

  return (
    <>
      <Typography variant="h4" sx={{ m: 5 }}>
        {t('welcomeToCoup')}
      </Typography>
      <Typography variant="h5" sx={{ m: 5 }}>
        {t('briefDescriptionOfCoup')}
      </Typography>
      <Grid>
        <Button
          type="submit" sx={{ mt: 5 }}
          variant="contained"
          onClick={() => { navigate(`/create-game`) }}
          startIcon={<AddCircle />}
        >{t('createNewGame')}</Button>
      </Grid>
      <Grid>
        <Button
          type="submit" sx={{ mt: 5 }}
          variant="contained"
          onClick={() => { navigate(`/join-game`) }}
          startIcon={<GroupAdd />}
        >{t('joinExistingGame')}</Button>
      </Grid>
      <GitHubLinks />
    </>
  )
}

export default Home
