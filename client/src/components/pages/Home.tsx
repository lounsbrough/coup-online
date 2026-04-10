import { Button, Grid } from "@mui/material"
import { Link as RouterLink } from "react-router"
import GitHubLinks from "../GitHubLinks"
import LegalLinks from "../LegalLinks"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import { AddCircle, EmojiEvents, Gavel, GroupAdd } from "@mui/icons-material"
import CoupTypography from '../utilities/CoupTypography'

interface HomeProps {
  setRulesOpen: (open: boolean) => void
}

function Home({ setRulesOpen }: Readonly<HomeProps>) {
  const { t } = useTranslationContext()

  return (
    <>
      <CoupTypography variant="h4" sx={{ m: 5 }} addTextShadow>
        {t('welcomeToCoup')}
      </CoupTypography>
      <CoupTypography variant="h5" sx={{ m: 5 }} addTextShadow>
        {t('briefDescriptionOfCoup')}
      </CoupTypography>
      <Grid container direction="column" alignItems="center" spacing={5} mt={10}>
        <Button
          variant='contained'
          onClick={() => setRulesOpen(true)}
          startIcon={<Gavel />}
        >{t('learnToPlay')}</Button>
        <Button
          variant="contained"
          component={RouterLink}
          to="/create-game"
          startIcon={<AddCircle />}
        >{t('createNewGame')}</Button>
        <Button
          variant="contained"
          component={RouterLink}
          to="/join-game"
          startIcon={<GroupAdd />}
        >{t('joinExistingGame')}</Button>
        <Button
          variant="contained"
          component={RouterLink}
          to="/leaderboard"
          startIcon={<EmojiEvents />}
        >{t('viewLeaderboard')}</Button>
      </Grid>
      <LegalLinks />
      <GitHubLinks />
    </>
  )
}

export default Home
