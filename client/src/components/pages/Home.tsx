import { Button, Grid2, Typography } from "@mui/material"
import { useNavigate } from "react-router"
import GitHubLinks from "../GitHubLinks"
import { useTranslationContext } from "../../contexts/TranslationsContext"

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
      <Grid2>
        <Button
          type="submit" sx={{ mt: 5 }}
          variant="contained"
          onClick={() => { navigate(`/create-game`) }}
        >{t('createNewGame')}</Button>
      </Grid2>
      <Grid2>
        <Button
          type="submit" sx={{ mt: 5 }}
          variant="contained"
          onClick={() => { navigate(`/join-game`) }}
        >{t('joinExistingGame')}</Button>
      </Grid2>
      <GitHubLinks />
    </>
  )
}

export default Home
