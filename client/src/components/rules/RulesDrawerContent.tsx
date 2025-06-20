import { useMemo } from "react"
import { Box, DialogContent, DialogContentText, Divider, Typography, useTheme } from "@mui/material"
import { Group } from "@mui/icons-material"
import { ActionAttributes, Actions, Influences } from '@shared'
import InfluenceIcon from "../icons/InfluenceIcon"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import './Rules.css'

export default function RulesDrawerContent() {
  const { breakpoints, actionColors, influenceColors } = useTheme()
  const { t } = useTranslationContext()

  const influenceText = useMemo(() => Object.fromEntries(
    Object.values(Influences).map((influence) =>
      ([influence, <Typography component="span" fontSize="large" fontWeight='bold' color={influence}>{t(influence)}</Typography>]))
  ), [t])

  const actionText = useMemo(() => Object.fromEntries(
    Object.entries(ActionAttributes).map(([action, { influenceRequired }]) =>
      [action, <Typography component="span" fontSize="large" fontWeight='bold' color={influenceRequired as Influences}>{t(action as Actions)}</Typography>]
    )
  ), [t])

  const anyIndicator = <><Group sx={{ mb: -1 }} /><br /><span style={{ verticalAlign: 'middle' }}>{` ${t('anyone')}`}</span></>

  return (
    <DialogContent sx={{
      px: 4,
      [breakpoints.up('md')]: { px: undefined },
      textAlign: 'center'
    }}>
      <DialogContentText component='div'>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold" }}
        >{t('cheatSheet')}</Typography>
        <Box sx={{ mt: 3 }}>
          <table className="cheat-sheet-table">
            <tbody>
              <tr style={{ background: actionColors[Actions.Income] }}>
                <td>{anyIndicator}</td>
                <td>
                  {t(Actions.Income)}
                  <br />
                  {t('collectCoins', { count: 1 })}
                </td>
              </tr>
              <tr style={{ background: actionColors[Actions.ForeignAid] }}>
                <td>{anyIndicator}</td>
                <td>
                  {t(Actions.ForeignAid)}
                  <br />
                  {t('collectCoins', { count: 2 })}
                </td>
              </tr>
              <tr style={{ background: actionColors[Actions.Coup] }}>
                <td>{anyIndicator}</td>
                <td>
                  {t(Actions.Coup)}
                  <br />
                  {t('payCoins', { count: 7 })}
                  <br />
                  {t('killAnInfluence')}
                </td>
              </tr>
              <tr style={{ background: actionColors[Actions.Coup] }}>
                <td>{anyIndicator}</td>
                <td>
                  {t(Actions.Revive)}
                  <br />
                  {t('payCoins', { count: 10 })}
                  <br />
                  {t('reviveAnInfluence')}
                </td>
              </tr>
              <tr style={{ background: influenceColors[Influences.Duke] }}>
                <td>
                  <InfluenceIcon influence={Influences.Duke} />
                  <br />
                  {t(Influences.Duke)}
                </td>
                <td>
                  {t(Actions.Tax)}
                  <br />
                  {t('collectCoins', { count: 3 })}
                  <br />
                  {t('block')} {t(Actions.ForeignAid)}
                </td>
              </tr>
              <tr style={{ background: influenceColors[Influences.Assassin] }}>
                <td>
                  <InfluenceIcon influence={Influences.Assassin} />
                  <br />
                  {t(Influences.Assassin)}
                </td>
                <td>
                  {t(Actions.Assassinate)}
                  <br />
                  {t('payCoins', { count: 3 })}
                  <br />
                  {t('killAnInfluence')}
                </td>
              </tr>
              <tr style={{ background: influenceColors[Influences.Ambassador] }}>
                <td>
                  <InfluenceIcon influence={Influences.Ambassador} />
                  <br />
                  {t(Influences.Ambassador)}
                </td>
                <td>
                  {t(Actions.Exchange)}
                  <br />
                  {t('draw2InfluencesAndDiscard2')}
                  <br />
                  {t('block')} {t(Actions.Steal)}
                </td>
              </tr>
              <tr style={{ background: influenceColors[Influences.Captain] }}>
                <td>
                  <InfluenceIcon influence={Influences.Captain} />
                  <br />
                  {t(Influences.Captain)}
                </td>
                <td>
                  {t(Actions.Steal)}
                  <br />
                  {t('steal2CoinsFromSomeone')}
                  <br />
                  {t('block')} {t(Actions.Steal)}
                </td>
              </tr>
              <tr style={{ background: influenceColors[Influences.Contessa] }}>
                <td>
                  <InfluenceIcon influence={Influences.Contessa} />
                  <br />
                  {t(Influences.Contessa)}
                </td>
                <td>
                  {t('block')} {t(Actions.Assassinate)}
                </td>
              </tr>
            </tbody>
          </table>
        </Box>
        <Divider sx={{ my: 8 }} />
        <Typography
          variant="h4"
          sx={{ fontWeight: 'bold' }}
        >{t('fullRules')}</Typography>
        <Box sx={{ textAlign: 'left' }}>
          <p><strong>{t('numberOfPlayers')}</strong>: 2-6.</p>
          <p><strong>{t('goal')}</strong>: {t('rulesGoal')}</p>
          <p><strong>{t('contents')}</strong>: {t('rulesContents')}</p>
          <p><strong>{t('setup')}</strong>: {t('rulesSetup')}</p>
          <p><strong>{t('influences')}</strong>: {t('rulesInfluences')}</p>
          <ul>
            <li>{influenceText[Influences.Duke]}: {t('rulesDuke')}</li>
            <li>{influenceText[Influences.Assassin]}: {t('rulesAssassin')}</li>
            <li>{influenceText[Influences.Captain]}: {t('rulesCaptain')}</li>
            <li>{influenceText[Influences.Ambassador]}: {t('rulesAmbassador')}</li>
            <li>{influenceText[Influences.Contessa]}: {t('rulesContessa')}</li>
          </ul>
          <p><strong>{t('actions')}</strong>: {t('rulesActions')}</p>
          <ul>
            <li>{actionText[Actions.Income]}: {t('rulesIncome')}</li>
            <li>{actionText[Actions.ForeignAid]}: {t('rulesForeignAid')}</li>
            <li>{actionText[Actions.Coup]}: {t('rulesCoup')}</li>
            <li>{actionText[Actions.Revive]}: {t('rulesRevive')}</li>
            <li>{actionText[Actions.Tax]}: {t('rulesTax')}</li>
            <li>{actionText[Actions.Assassinate]}: {t('rulesAssassinate')}</li>
            <li>{actionText[Actions.Steal]}: {t('rulesSteal')}</li>
            <li>{actionText[Actions.Exchange]}: {t('rulesExchange')}</li>
          </ul>
          <p><strong>{t('challenge')}</strong>: {t('rulesChallenge')}</p>
          <p><strong>{t('block')}</strong>: {t('rulesBlock')}</p>
          <p><strong>{t('losingAChallenge')}</strong>: {t('rulesLosingAChallenge')}</p>
          <p><strong>{t('losingInfluence')}</strong>: {t('rulesLosingInfluence')}</p>
        </Box>
      </DialogContentText>
    </DialogContent>
  )
}
