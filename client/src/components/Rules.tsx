import { useState } from "react"
import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material"
import { Gavel } from "@mui/icons-material"
import { colord } from "colord"
import { InfluenceAttributes } from "../shared/types/game"
import { useColorModeContext } from "../context/MaterialThemeContext"
import './Rules.css'

function Rules() {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const { colorMode } = useColorModeContext()

  const influenceBackgroundOpacity = 0.5

  return (
    <>
      <Button
        startIcon={<Gavel />}
        onClick={() => {
          setModalOpen(true)
        }}
      >
        Rules
      </Button>
      <Dialog
        fullWidth
        maxWidth={false}
        open={modalOpen}
        onClose={() => { setModalOpen(false) }}
      >
        <DialogContent>
          <DialogContentText component='div'>
            <h2>Cheat Sheet</h2>
            <table className="cheat-sheet-table">
              <thead>
                <tr>
                  <th>Influence</th>
                  <th>Action</th>
                  <th>Block</th>
                  <th>Effect</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                  <td>Income</td>
                  <td></td>
                  <td>Collect 1 coin</td>
                </tr>
                <tr>
                  <td></td>
                  <td>Foreign Aid</td>
                  <td></td>
                  <td>Collect 2 coins</td>
                </tr>
                <tr>
                  <td></td>
                  <td>Coup</td>
                  <td></td>
                  <td>Pay 7 coins to kill an influence</td>
                </tr>
                <tr style={{
                  background: colord(InfluenceAttributes.Duke.color[colorMode]).alpha(influenceBackgroundOpacity).toRgbString()
                }}>
                  <td>Duke</td>
                  <td>Tax</td>
                  <td>Foreign Aid</td>
                  <td>Collect 3 coins</td>
                </tr>
                <tr style={{
                  background: colord(InfluenceAttributes.Assassin.color[colorMode]).alpha(influenceBackgroundOpacity).toRgbString()
                }}>
                  <td>Assassin</td>
                  <td>Assassinate</td>
                  <td></td>
                  <td>Pay 3 coins to kill an influence</td>
                </tr>
                <tr style={{
                  background: colord(InfluenceAttributes.Ambassador.color[colorMode]).alpha(influenceBackgroundOpacity).toRgbString()
                }}>
                  <td>Ambassador</td>
                  <td>Exchange</td>
                  <td>Stealing</td>
                  <td>Draw 2 influences and put 2 back</td>
                </tr>
                <tr style={{
                  background: colord(InfluenceAttributes.Captain.color[colorMode]).alpha(influenceBackgroundOpacity).toRgbString()
                }}>
                  <td>Captain</td>
                  <td>Steal</td>
                  <td>Stealing</td>
                  <td>Steal 2 coins from another player</td>
                </tr>
                <tr style={{
                  background: colord(InfluenceAttributes.Contessa.color[colorMode]).alpha(influenceBackgroundOpacity).toRgbString()
                }}>
                  <td>Contessa</td>
                  <td></td>
                  <td>Assassination</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <h2 style={{ marginTop: '48px' }}>Full Rules</h2>
            <p><strong>Number of players</strong>: 2-6.</p>
            <p><strong>Object</strong>: To be the only player with any influence cards left.</p>
            <p><strong>Materials</strong>: Deck of influence cards, bank of coins.</p>
            <p><strong>Setup</strong>: Shuffle the cards and deal two to each player. Players should look at their cards but keep them hidden from everyone else. Each player takes two coins from the bank as their starting wealth.</p>
            <p><strong>Influences</strong>: There are five different characters in the influence deck (three of each character).</p>
            <ul>
              <li><strong>Duke</strong>: Can Tax and Block Foreign Aid.</li>
              <li><strong>Assassin</strong>: Can Force one player to give up an Influence card.</li>
              <li><strong>Captain</strong>: Can Steal two coins from another player and Block stealing attempts.</li>
              <li><strong>Ambassador</strong>: Can Exchange your Influence cards with new ones from the deck and Block stealing attempts.</li>
              <li><strong>Contessa</strong>: Can Block assassination attempts.</li>
            </ul>
            <p><strong>Actions</strong>: Players take turns performing one of these available actions:</p>
            <ul>
              <li><strong>Income</strong>: Take one coin from the bank. Cannot be Challenged or Blocked.</li>
              <li><strong>Foreign Aid</strong>: Take two coins from the bank. Cannot be Challenged. Can be Blocked by the Duke.</li>
              <li><strong>Coup</strong>: Costs seven coins. Cause a player to give up an Influence card. Cannot be Challenged or Blocked. If you start your turn with 10+ coins, you must take this action.</li>
              <li><strong>Tax</strong>: (the Duke): Take three coins from the bank. Can be Challenged. Cannot be Blocked.</li>
              <li><strong>Assassinate</strong>: (the Assassin): Costs three coins. Force one player to give up an Influence card of their choice. Can be Challenged. Can be Blocked by the Contessa.</li>
              <li><strong>Steal</strong>: (the Captain): Take two coins from another player. Can be Challenged. Can be Blocked by Captain or Ambassador.</li>
              <li><strong>Exchange</strong>: (the Ambassador): Draw two Influence cards from the deck, look at them and mix them with your current Influence cards. Place two cards back in the deck and shuffle the deck. Can be Challenged. Cannot be Blocked.</li>
            </ul>
            <p><strong>Challenge</strong>: When the acting player declares their action, any other player may Challenge their right to take the action. They are saying “I don't believe you have the proper character to do that.” The acting player now must prove they have the power to take the action or lose the Challenge. If they have the right character, they reveal it and place the revealed card back in the deck. They then shuffle the deck and draw a new card. The Challenging player has lost the Challenge. If they do NOT have the proper character, they lose the Challenge.</p>
            <p><strong>Blocking</strong>: If another player takes an action that can be Blocked, the targeted player, or anyone in the case of Foreign Aid, may Block it by claiming to have the proper character on one of their Influence cards. The acting player cannot perform the action and takes no other action this turn. Any player may choose to Challenge the Blocking player. If they win the Challenge, the action goes through as normal.</p>
            <p><strong>Losing a Challenge</strong>: Any player who loses a Challenge must turn one of their Influence cards face up for all to see. If that is their last Influence card, they are out of the game.</p>
            <p><strong>Losing Influence</strong>: Any time a player loses an Influence card, THEY choose which of their cards to reveal.</p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={() => { setModalOpen(false) }}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Rules
