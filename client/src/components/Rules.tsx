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

  const noneIndicator = <><Block sx={{ verticalAlign: 'middle', }} />{isSmallScreen ? <br /> : null}<span style={{ verticalAlign: 'middle' }}>{' None'}</span></>
  const anyIndicator = <><Group sx={{ verticalAlign: 'middle', }} />{isSmallScreen ? <br /> : null}<span style={{ verticalAlign: 'middle' }}>{' Anyone'}</span></>

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
              aria-label="close"
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
                          {Actions.Income}
                          <br />
                          {t('collectCoins', { count: 1 })}
                        </td>
                      </tr>
                      <tr style={{ background: actionColors[Actions.ForeignAid] }}>
                        <td>{anyIndicator}</td>
                        <td>
                          {Actions.ForeignAid}
                          <br />
                          {t('collectCoins', { count: 2 })}
                        </td>
                      </tr>
                      <tr style={{ background: actionColors[Actions.Coup] }}>
                        <td>{anyIndicator}</td>
                        <td>
                          {Actions.Coup}
                          <br />
                          Pay 7 coins
                          <br />
                          Kill an influence
                        </td>
                      </tr>
                      <tr style={{ background: influenceColors[Influences.Duke] }}>
                        <td>
                          <InfluenceIcon influence={Influences.Duke} />
                          <br />
                          {Influences.Duke}
                        </td>
                        <td>
                          {Actions.Tax}
                          <br />
                          {t('collectCoins', { count: 3 })}
                          <br />
                          Block Foreign Aid
                        </td>
                      </tr>
                      <tr style={{ background: influenceColors[Influences.Assassin] }}>
                        <td>
                          <InfluenceIcon influence={Influences.Assassin} />
                          <br />
                          {Influences.Assassin}
                        </td>
                        <td>
                          {Actions.Assassinate}
                          <br />
                          Pay 3 coins
                          <br />
                          Kill an influence
                        </td>
                      </tr>
                      <tr style={{ background: influenceColors[Influences.Ambassador] }}>
                        <td>
                          <InfluenceIcon influence={Influences.Ambassador} />
                          <br />
                          {Influences.Ambassador}
                        </td>
                        <td>
                          {Actions.Exchange}
                          <br />
                          Draw 2 influences & Discard 2
                          <br />
                          Block Stealing
                        </td>
                      </tr>
                      <tr style={{ background: influenceColors[Influences.Captain] }}>
                        <td>
                          <InfluenceIcon influence={Influences.Captain} />
                          <br />
                          {Influences.Captain}
                        </td>
                        <td>
                          {Actions.Steal}
                          <br />
                          Steal 2 coins from someone
                          <br />
                          Block Stealing
                        </td>
                      </tr>
                      <tr style={{ background: influenceColors[Influences.Contessa] }}>
                        <td>
                          <InfluenceIcon influence={Influences.Contessa} />
                          <br />
                          {Influences.Contessa}
                        </td>
                        <td>
                          Block Assassination
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <table className="cheat-sheet-table large-screen">
                    <thead>
                      <tr>
                        <th>Influence</th>
                        <th>Action</th>
                        <th>Effect</th>
                        <th>Block</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: actionColors[Actions.Income] }}>
                        <td>{anyIndicator}</td>
                        <td>{Actions.Income}</td>
                        <td>{t('collectCoins', { count: 1 })}</td>
                        <td>{noneIndicator}</td>
                      </tr>
                      <tr style={{ background: actionColors[Actions.ForeignAid] }}>
                        <td>{anyIndicator}</td>
                        <td>{Actions.ForeignAid}</td>
                        <td>{t('collectCoins', { count: 2 })}</td>
                        <td>{noneIndicator}</td>
                      </tr>
                      <tr style={{ background: actionColors[Actions.Coup] }}>
                        <td>{anyIndicator}</td>
                        <td>{Actions.Coup}</td>
                        <td>Pay 7 coins - Kill an influence</td>
                        <td>{noneIndicator}</td>
                      </tr>
                      <tr style={{
                        background: influenceColors[Influences.Duke]
                      }}>
                        <td>
                          <InfluenceIcon influence={Influences.Duke} />
                          <span> {Influences.Duke}</span>
                        </td>
                        <td>{Actions.Tax}</td>
                        <td>{t('collectCoins', { count: 3 })}</td>
                        <td>Foreign Aid</td>
                      </tr>
                      <tr style={{
                        background: influenceColors[Influences.Assassin]
                      }}>
                        <td>
                          <InfluenceIcon influence={Influences.Assassin} />
                          <span> {Influences.Assassin}</span>
                        </td>
                        <td>{Actions.Assassinate}</td>
                        <td>Pay 3 coins - Kill an influence</td>
                        <td>{noneIndicator}</td>
                      </tr>
                      <tr style={{
                        background: influenceColors[Influences.Ambassador]
                      }}>
                        <td>
                          <InfluenceIcon influence={Influences.Ambassador} />
                          <span> {Influences.Ambassador}</span>
                        </td>
                        <td>{Actions.Exchange}</td>
                        <td>Draw 2 influences - Discard 2</td>
                        <td>Stealing</td>
                      </tr>
                      <tr style={{
                        background: influenceColors[Influences.Captain]
                      }}>
                        <td>
                          <InfluenceIcon influence={Influences.Captain} />
                          <span> {Influences.Captain}</span>
                        </td>
                        <td>{Actions.Steal}</td>
                        <td>Steal 2 coins from someone</td>
                        <td>Stealing</td>
                      </tr>
                      <tr style={{
                        background: influenceColors[Influences.Contessa]
                      }}>
                        <td>
                          <InfluenceIcon influence={Influences.Contessa} />
                          <span> {Influences.Contessa}</span>
                        </td>
                        <td>{noneIndicator}</td>
                        <td>{noneIndicator}</td>
                        <td>Assassination</td>
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
