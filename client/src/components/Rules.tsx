import { useState, forwardRef } from "react"
import { AppBar, Box, Button, Dialog, DialogContent, DialogContentText, Divider, IconButton, Toolbar, Typography, Slide, useTheme } from "@mui/material"
import { Block, Close, Gavel, Group } from "@mui/icons-material"
import { TransitionProps } from '@mui/material/transitions'
import { ActionAttributes, Actions, Influences } from '@shared'
import './Rules.css'
import InfluenceIcon from "./icons/InfluenceIcon"
import { useTranslationContext } from "../contexts/TranslationsContext"

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} appear={props.appear ?? false} />
})

const influenceText = Object.fromEntries(
  Object.values(Influences).map((influence) =>
    ([influence, <Typography component="span" fontSize="large" fontWeight='bold' color={influence}>{influence}</Typography>]))
)

const actionText = Object.fromEntries(
  Object.entries(ActionAttributes).map(([action, { influenceRequired }]) =>
    [action, <Typography component="span" fontSize="large" fontWeight='bold' color={influenceRequired as Influences}>{action}</Typography>]
  )
)

function Rules() {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const { breakpoints, actionColors, influenceColors, isSmallScreen } = useTheme()
  const { t } = useTranslationContext()

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
        TransitionComponent={Transition}
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
              <Close />
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
              <p><strong>Number of players</strong>: 2-6.</p>
              <p><strong>Goal</strong>: To be the only player with any influence cards left.</p>
              <p><strong>Contents</strong>: Deck of influence cards, bank of coins.</p>
              <p><strong>Setup</strong>: Shuffle the cards and deal two to each player. Players should look at their cards but keep them hidden from everyone else. Each player takes two coins from the bank as their starting wealth. In a game with only two players, the starting player begins the game with one coin instead of two.</p>
              <p><strong>Influences</strong>: There are five different characters in the influence deck (three of each character).</p>
              <ul>
                <li>{influenceText[Influences.Duke]}: Can Tax and Block Foreign Aid.</li>
                <li>{influenceText[Influences.Assassin]}: Can Force one player to give up an Influence card.</li>
                <li>{influenceText[Influences.Captain]}: Can Steal two coins from another player and Block stealing attempts.</li>
                <li>{influenceText[Influences.Ambassador]}: Can Exchange your Influence cards with new ones from the deck and Block stealing attempts.</li>
                <li>{influenceText[Influences.Contessa]}: Can Block assassination attempts.</li>
              </ul>
              <p><strong>Actions</strong>: Players take turns performing one of these available actions:</p>
              <ul>
                <li>{actionText[Actions.Income]}: Take one coin from the bank. Cannot be Challenged or Blocked.</li>
                <li>{actionText[Actions.ForeignAid]}: Take two coins from the bank. Cannot be Challenged. Can be Blocked by the {influenceText[Influences.Duke]}.</li>
                <li>{actionText[Actions.Coup]}: Costs seven coins. Cause a player to give up an Influence card. Cannot be Challenged or Blocked. If you start your turn with 10+ coins, you must take this action.</li>
                <li>{actionText[Actions.Tax]}: Take three coins from the bank. Can be Challenged. Cannot be Blocked.</li>
                <li>{actionText[Actions.Assassinate]}: Costs three coins. Force one player to give up an Influence card of their choice. Can be Challenged. Can be Blocked by the {influenceText[Influences.Contessa]}.</li>
                <li>{actionText[Actions.Steal]}: Take two coins from another player. Can be Challenged. Can be Blocked by {influenceText[Influences.Captain]} or {influenceText[Influences.Ambassador]}.</li>
                <li>{actionText[Actions.Exchange]}: Draw two Influence cards from the deck, look at them and mix them with your current Influence cards. Place two cards back in the deck and shuffle the deck. Can be Challenged. Cannot be Blocked.</li>
              </ul>
              <p><strong>Challenge</strong>: When the acting player declares their action, any other player may Challenge their right to take the action. They are saying "I don't believe you have the proper character to do that." The acting player now must prove they have the power to take the action or lose the Challenge. If they have the right character, they reveal it and place the revealed card back in the deck. They then shuffle the deck and draw a new card. The Challenging player has lost the Challenge. If they do not have the proper character, they lose the Challenge.</p>
              <p><strong>Blocking</strong>: If another player takes an action that can be Blocked, the targeted player, or anyone in the case of Foreign Aid, may Block it by claiming to have the proper character on one of their Influence cards. The acting player cannot perform the action and takes no other action this turn. Any player may choose to Challenge the Blocking player. If they win the Challenge, the action goes through as normal.</p>
              <p><strong>Losing a Challenge</strong>: Any player who loses a Challenge must turn one of their Influence cards face up for all to see. If that is their last Influence card, they are out of the game.</p>
              <p><strong>Losing Influence</strong>: Any time a player loses an Influence card, they choose which of their cards to reveal.</p>
            </Box>
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Rules
