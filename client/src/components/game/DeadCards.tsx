import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid2, Typography } from "@mui/material";
import { useState } from "react";
import { useGameStateContext } from "../../context/GameStateContext";
import InfluenceCard from "./InfluenceCard";

function DeadCards() {
  const [modalOpen, setModalOpen] = useState(false);
  const { gameState } = useGameStateContext();

  if (!gameState) {
    return null;
  }

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        onClick={() => { setModalOpen(true) }}
      >View Dead Cards</Button>
      {modalOpen && (
        <Dialog
          open={modalOpen}
          onClose={() => { setModalOpen(false); }}
        >
          <DialogTitle variant="h5" textAlign="center">Dead Cards</DialogTitle>
          <DialogContent>
            {gameState.deadCards.length
              ? <Grid2 container spacing={2}>
                {gameState.deadCards.map((influence, index) =>
                  <InfluenceCard key={index} influence={influence} />)}
              </Grid2>
              : <Typography variant="h6">No dead cards yet</Typography>}
          </DialogContent>
          <DialogActions>
            <Button variant='contained' onClick={() => { setModalOpen(false); }}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

export default DeadCards;
