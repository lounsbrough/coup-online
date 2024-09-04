import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material";
import { Gavel } from "@mui/icons-material";
import './Rules.css';
import { InfluenceAttributes } from "../shared/types/game";
import { useColorModeContext } from "../context/MaterialThemeContext";

function Rules() {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { colorMode } = useColorModeContext();

  return (
    <>
      <Button
        startIcon={<Gavel />}
        onClick={() => {
          setModalOpen(true);
        }}
      >
        Rules
      </Button>
      <Dialog
        fullWidth
        maxWidth={false}
        open={modalOpen}
        onClose={() => { setModalOpen(false); }}
      >
        <DialogContent>
          <DialogContentText>
            <h2>Cheat Sheet</h2>
            <table className="cheat-sheet-table">
              <thead>
                <tr>
                  <th>Influence</th><th>Action</th><th>Effect</th><th>Block</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                  <td>Income</td>
                  <td>Collect 1 coin</td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td>Foreign Aid</td>
                  <td>Collect 2 coins</td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td>Coup</td>
                  <td>Pay 7 coins and make a player lose an influence</td>
                  <td></td>
                </tr>
                <tr style={{ background: InfluenceAttributes.Duke.color[colorMode] }}>
                  <td>Duke</td>
                  <td>Tax</td>
                  <td>Collect 3 coins</td>
                  <td>Block Foreign Aid</td>
                </tr>
                <tr style={{ background: InfluenceAttributes.Assassin.color[colorMode] }}>
                  <td>Assassin</td>
                  <td>Assassinate</td>
                  <td>Pay 3 coins and make a player lose an influence</td>
                  <td></td>
                </tr>
                <tr style={{ background: InfluenceAttributes.Ambassador.color[colorMode] }}>
                  <td>Ambassador</td>
                  <td>Exchange</td>
                  <td>Draw 2 influences and put 2 back</td>
                  <td>Block Stealing</td>
                </tr>
                <tr style={{ background: InfluenceAttributes.Captain.color[colorMode] }}>
                  <td>Captain</td>
                  <td>Steal</td>
                  <td>Steal 2 coins from another player</td>
                  <td>Block Stealing</td>
                </tr>
                <tr style={{ background: InfluenceAttributes.Contessa.color[colorMode] }}>
                  <td>Contessa</td>
                  <td></td>
                  <td></td>
                  <td>Block Assassination</td>
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
              <li><strong>Captain</strong>: Can Steals two coins from another player and Block stealing attempts.</li>
              <li><strong>Ambassador</strong>: Can Exchange your Influence cards with new ones from the deck and Block stealing attempts.</li>
              <li><strong>Contessa</strong>: Can Block assassination attempts.</li>
            </ul>
            <p><strong>Actions</strong>: Players take turns performing one of these available actions:</p>
            <ul>
              <li>Income: Take one coin from the bank. This cannot be Challenged or Blocked.</li>
              <li>Foreign Aid: Take two coins from the bank. This cannot be Challenged but it can be Blocked by the Duke.</li>
              <li>Coup: Costs seven coins. Cause a player to give up an Influence card. Cannot be Challenged or Blocked. If you start your turn with 10+ coins, you must take this action.</li>
              <li>Tax (the Duke): Take three coins from the bank. Can be Challenged.</li>
              <li>Assassinate (the Assassin): Costs three coins. Force one player to give up an Influence card of their choice. Can be Challenged. Can be Blocked by the Contessa.</li>
              <li>Steal (the Captain): Take two coins from another player. Can be Challenged. Can be Blocked by another Captain or an Ambassador.</li>
              <li>Exchange (the Ambassador): Draw two Influence cards from the deck, look at them and mix them with your current Influence cards. Place two cards back in the deck and shuffle the deck. Can be Challenged. Cannot be Blocked.</li>
            </ul>
            <p><strong>Blocking</strong>: If another player takes an action that can be Blocked, any other player may Block it by claiming to have the proper character on one of their Influence cards. The acting player cannot perform the action and takes no other action this turn. The acting player MAY choose to Challenge the Blocking player. If they win the Challenge, the action goes through as normal.</p>
            <p><strong>Challenge</strong>: When the acting player declares their action, any other player may Challenge their right to take the action. They are saying “I don't believe you have the proper character to do that.” The acting player now must prove they have the power to take the action or lose the Challenge. If they have the right character, they reveal it and place the revealed card back in the deck. They then shuffle the deck and draw a new card. The Challenging player has lost the Callenge. If they do NOT have the proper character, they lose the Challenge.</p>
            <p><strong>Losing a Challenge</strong>: Any player who loses a Challenge must turn one of their Influence cards face up for all to see. If that is their last Influence card, they are out of the game.</p>
            <p><strong>Losing Influence</strong>: Any time a player loses an Influence card, THEY choose which of their cards to reveal.</p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setModalOpen(false); }}>Close</Button>
        </DialogActions>
      </Dialog >
    </>
  );
}

export default Rules;
