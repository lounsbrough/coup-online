import { Box, Grid2, Tooltip, Typography, useTheme } from "@mui/material"
import PlayerInfluences from "../game/PlayerInfluences"
import Players from "../game/Players"
import EventLog from "./EventLog"
import RequestReset from "./RequestReset"
import PlayerDecision from "./PlayerDecision"
import SnarkyDeadComment from "./SnarkyDeadComment"
import Victory from "./Victory"
import PlayAgain from "./PlayAgain"
import { useGameStateContext } from "../../contexts/GameStateContext"
import CardDeck from "../icons/CardDeck"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import Forfeit from "./Forfeit"

interface GameBoardProps {
  leftDrawerOpen: boolean
  rightDrawerOpen: boolean
}

function GameBoard({ leftDrawerOpen, rightDrawerOpen }: GameBoardProps) {
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()
  const theme = useTheme()

  if (!gameState?.selfPlayer) {
    return null
  }

  const turnPlayer = gameState.players.find((player) =>
    player.name === gameState.turnPlayer
  )
  const playersLeft = gameState.players.filter(({ influenceCount }) => influenceCount)
  const gameIsOver = playersLeft.length === 1

  const centeredOnSmallScreen = {
    justifyContent: 'center',
    textAlign: 'center',
    [theme.breakpoints.up('md')]: {
      justifyContent: 'flex-end',
      textAlign: 'right'
    }
  }

  const drawerIsOpen = leftDrawerOpen || rightDrawerOpen

  return (
    <Grid2 container className="game-board">
      <Grid2 size={{ xs: 12, sm: 12, md: 0, lg: drawerIsOpen ? 0 : 3 }} />
      <Grid2
        p={2}
        size={{ xs: 12, sm: 12, md: 9, lg: drawerIsOpen ? 9 : 6 }}
      >
        {gameIsOver && (
          <Grid2 sx={{ m: 5 }}>
            <Victory player={playersLeft[0]} />
          </Grid2>
        )}
        {gameIsOver && (
          <Grid2 sx={{ m: 5 }}>
            <PlayAgain />
          </Grid2>
        )}
        {!gameState.selfPlayer.influences.length && (
          <Grid2>
            <SnarkyDeadComment />
          </Grid2>
        )}
        {turnPlayer && !gameIsOver && (
          <Box my={2}>
            <Typography variant="h4">
              {t('playerTurn', {
                primaryPlayer: gameState.turnPlayer,
                gameState
              })}
            </Typography>
          </Box>
        )}
        {!!gameState?.selfPlayer?.influences?.length && (
          <Grid2 container justifyContent="center" my={4}>
            <PlayerInfluences />
          </Grid2>
        )}
        <Grid2 container justifyContent="center" sx={{ my: 2 }}>
          <Players />
        </Grid2>
        {!gameIsOver && (
          <Grid2 container justifyContent="center">
            <Grid2 sx={{ p: 2 }}>
              <PlayerDecision />
            </Grid2>
          </Grid2>
        )}
      </Grid2>
      <Grid2
        size={{ xs: 12, sm: 12, md: 3 }}
        sx={{ p: 2 }}
      >
        <Grid2
          container
          p={1}
          spacing={0.5}
          sx={centeredOnSmallScreen}
        >
          <Grid2 size={12}>
            <EventLog />
          </Grid2>
          <Grid2
            container
            size={12}
            alignItems='center'
            sx={{
              ...centeredOnSmallScreen,
              fontSize: '2rem'
            }}>
            <Tooltip
              title={
                <Typography variant="h6">
                  {t('cardCountInDeck', {
                    count: gameState.deckCount
                  })}
                </Typography>
              }>
              <Typography
                display='flex'
                alignItems='center'
                component='span'
                fontSize='smaller'
              >{gameState.deckCount}<CardDeck sx={{ fontSize: 'inherit', ml: 0.5 }} /></Typography>
            </Tooltip>
          </Grid2>
          <Grid2 size={12}>
            <RequestReset />
          </Grid2>
          <Grid2 size={12}>
            <Forfeit />
          </Grid2>
        </Grid2>
      </Grid2>
    </Grid2 >
  )
}

export default GameBoard
