import { useState, forwardRef, useMemo } from "react"
import { AppBar, Box, Button, Dialog, DialogContent, DialogContentText, Divider, IconButton, Toolbar, Typography, Slide, useTheme, DialogActions } from "@mui/material"
import { Block, Close, Gavel, Group } from "@mui/icons-material"
import { TransitionProps } from '@mui/material/transitions'
import { ActionAttributes, Actions, Influences } from '@shared'
import InfluenceIcon from "./icons/InfluenceIcon"
import { useTranslationContext } from "../contexts/TranslationsContext"
import './Rules.css'

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} appear={props.appear ?? false} />
})

function Rules() {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const { breakpoints, actionColors, influenceColors, isSmallScreen } = useTheme()
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

  const noneIndicator = <><Block sx={{ verticalAlign: 'middle', }} />{isSmallScreen ? <br /> : null}<span style={{ verticalAlign: 'middle' }}>{` ${t('none')}`}</span></>
  const anyIndicator = <><Group sx={{ verticalAlign: 'middle', }} />{isSmallScreen ? <br /> : null}<span style={{ verticalAlign: 'middle' }}>{` ${t('anyone')}`}</span></>

  return (
    <>
      {isSmallScreen ? (
        <IconButton
          color="primary"
          size="large"
          onClick={() => {
            setModalOpen(true)
          }}
        >
          <Gavel />
        </IconButton>
      ) : (
        <Button
          size="large"
          startIcon={<Gavel />}
          onClick={() => {
            setModalOpen(true)
          }}
        >
          {t('rules')}
        </Button>
      )}
      <Dialog
        fullScreen
        open={modalOpen}
        onClose={() => { setModalOpen(false) }}
        slots={{ transition: Transition }}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => { setModalOpen(false) }}
              aria-label={t('close')?.toString()}
              sx={{ ml: 1 }}
            >
              <Close fontSize="large" />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h5" component="div">
              <Gavel sx={{ verticalAlign: 'middle' }} /> <span style={{ verticalAlign: 'middle' }}>{t('rules')}</span>
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogContent sx={{
          px: isSmallScreen ? 4 : undefined,
          [breakpoints.up('md')]: { px: undefined },
          textAlign: 'center'
        }}>
          <DialogContentText component='div'>
            <Typography
              variant="h3"
              sx={{ fontWeight: "bold" }}
            >{t('cheatSheet')}</Typography>
            <Box sx={{ mt: 3 }}>
              {isSmallScreen
                ? (
                  <table className="cheat-sheet-table small-screen">
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
                ) : (
                  <table className="cheat-sheet-table large-screen">
                    <thead>
                      <tr>
                        <th>{t('influence')}</th>
                        <th>{t('action')}</th>
                        <th>{t('effect')}</th>
                        <th>{t('block')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: actionColors[Actions.Income] }}>
                        <td>{anyIndicator}</td>
                        <td>{t(Actions.Income)}</td>
                        <td>{t('collectCoins', { count: 1 })}</td>
                        <td></td>
                      </tr>
                      <tr style={{ background: actionColors[Actions.ForeignAid] }}>
                        <td>{anyIndicator}</td>
                        <td>{t(Actions.ForeignAid)}</td>
                        <td>{t('collectCoins', { count: 2 })}</td>
                        <td></td>
                      </tr>
                      <tr style={{ background: actionColors[Actions.Coup] }}>
                        <td>{anyIndicator}</td>
                        <td>{t(Actions.Coup)}</td>
                        <td>{t('payCoins', { count: 7 })} - {t('killAnInfluence')}</td>
                        <td></td>
                      </tr>
                      <tr style={{
                        background: influenceColors[Influences.Duke]
                      }}>
                        <td>
                          <InfluenceIcon influence={Influences.Duke} />
                          <span> {t(Influences.Duke)}</span>
                        </td>
                        <td>{t(Actions.Tax)}</td>
                        <td>{t('collectCoins', { count: 3 })}</td>
                        <td>{t(Actions.ForeignAid)}</td>
                      </tr>
                      <tr style={{
                        background: influenceColors[Influences.Assassin]
                      }}>
                        <td>
                          <InfluenceIcon influence={Influences.Assassin} />
                          <span> {t(Influences.Assassin)}</span>
                        </td>
                        <td>{t(Actions.Assassinate)}</td>
                        <td>{t('payCoins', { count: 3 })} - {t('killAnInfluence')}</td>
                        <td>{noneIndicator}</td>
                      </tr>
                      <tr style={{
                        background: influenceColors[Influences.Ambassador]
                      }}>
                        <td>
                          <InfluenceIcon influence={Influences.Ambassador} />
                          <span> {t(Influences.Ambassador)}</span>
                        </td>
                        <td>{t(Actions.Exchange)}</td>
                        <td>{t('draw2InfluencesAndDiscard2')}</td>
                        <td>{t(Actions.Steal)}</td>
                      </tr>
                      <tr style={{
                        background: influenceColors[Influences.Captain]
                      }}>
                        <td>
                          <InfluenceIcon influence={Influences.Captain} />
                          <span> {t(Influences.Captain)}</span>
                        </td>
                        <td>{t(Actions.Steal)}</td>
                        <td>{t('steal2CoinsFromSomeone')}</td>
                        <td>{t(Actions.Steal)}</td>
                      </tr>
                      <tr style={{
                        background: influenceColors[Influences.Contessa]
                      }}>
                        <td>
                          <InfluenceIcon influence={Influences.Contessa} />
                          <span> {t(Influences.Contessa)}</span>
                        </td>
                        <td>{noneIndicator}</td>
                        <td>{noneIndicator}</td>
                        <td>{t(Actions.Assassinate)}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
            </Box>
            <Divider sx={{ my: 8 }} />
            <Typography
              variant="h3"
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
        <DialogActions>
          <Button variant='contained' onClick={() => { setModalOpen(false) }}>
            {t('close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Rules
