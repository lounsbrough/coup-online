import { Button, Grid } from "@mui/material"
import { useNavigate } from "react-router"
import GitHubLinks from "../GitHubLinks"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import { AddCircle, GroupAdd } from "@mui/icons-material"
import CoupTypography from '../utilities/CoupTypography'

function Home() {
  const navigate = useNavigate()
  const { t } = useTranslationContext()

  return (
    <>
      <CoupTypography variant="h4" sx={{ m: 5 }} addTextShadow>
        {t('welcomeToCoup')}
      </CoupTypography>
      <CoupTypography variant="h5" sx={{ m: 5 }} addTextShadow>
        {t('briefDescriptionOfCoup')}
      </CoupTypography>
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
