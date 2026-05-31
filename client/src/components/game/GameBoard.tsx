import { Box, Grid, useTheme } from "@mui/material"
import PlayerInfluences from "../game/PlayerInfluences"
import Players from "../game/Players"
import EventLog from "./EventLog"
import RequestReset from "./RequestReset"
import PlayerDecision from "./PlayerDecision"
import SnarkyDeadComment from "./SnarkyDeadComment"
import Victory from "./Victory"
import PlayAgain from "./PlayAgain"
import GameSummary from "./GameSummary"
import { useGameStateContext } from "../../contexts/GameStateContext"
import CardDeck from "../icons/CardDeck"
import { useTranslationContext } from "../../contexts/TranslationsContext"
import Forfeit from "./Forfeit"
import CoupTypography from '../utilities/CoupTypography'
import Treasury from "../icons/Treasury"

interface GameBoardProps {
  leftDrawerOpen: boolean
  rightDrawerOpen: boolean
}

function GameBoard({ leftDrawerOpen, rightDrawerOpen }: Readonly<GameBoardProps>) {
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()
  const theme = useTheme()

  if (!gameState) {
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
    <Grid container className="game-board">
      <Grid size={{ xs: 12, sm: 12, md: 0, lg: drawerIsOpen ? 0 : 3 }} />
      <Grid
        sx={{ p: 2 }}
        size={{ xs: 12, sm: 12, md: 9, lg: drawerIsOpen ? 9 : 6 }}
      >
        {gameIsOver && (
          <Grid sx={{ m: 5 }}>
            <Victory player={playersLeft[0]} />
          </Grid>
        )}
        {gameIsOver && !!gameState.selfPlayer && (
          <Grid sx={{ m: 5 }}>
            <PlayAgain />
          </Grid>
        )}
        {gameIsOver && (
          <Grid sx={{ m: 5 }}>
            <GameSummary />
          </Grid>
        )}
        {gameState.selfPlayer?.influences.length === 0 && (
          <Grid>
            <SnarkyDeadComment />
          </Grid>
        )}
        {turnPlayer && !gameIsOver && (
          <Box sx={{ my: 2 }}>
            <CoupTypography variant="h4" addTextShadow>
              {t('playerTurn', {
                primaryPlayer: gameState.turnPlayer,
                gameState
              })}
            </CoupTypography>
          </Box>
        )}
        {!!gameState?.selfPlayer?.influences?.length && (
          <Grid container sx={{ justifyContent: 'center', my: 4 }}>
            <PlayerInfluences />
          </Grid>
        )}
        <Grid container sx={{ justifyContent: 'center', my: 2 }}>
          <Players />
        </Grid>
        {!gameIsOver && (
          <Grid container sx={{ justifyContent: 'center' }}>
            <Grid sx={{ p: 2 }}>
              <PlayerDecision />
            </Grid>
          </Grid>
        )}
      </Grid>
      <Grid
        size={{ xs: 12, sm: 12, md: 3 }}
        sx={{ p: 2 }}
      >
        <Grid
          container
          spacing={0.5}
          sx={{ p: 1, ...centeredOnSmallScreen }}
        >
          <Grid size={12}>
            <EventLog />
          </Grid>
          <Grid
            container
            size={12}
            sx={{
              alignItems: 'center',
              ...centeredOnSmallScreen,
              fontSize: '1.25rem'
            }}>
            <CoupTypography
              component='span'
              addTextShadow
              sx={{ display: 'flex', alignItems: 'center', fontSize: 'inherit' }}
            >
              {t('deck')}: <CardDeck sx={{ mx: 1, fontSize: 'inherit' }} /> {gameState.deckCount}
            </CoupTypography>
          </Grid>
          {gameState.settings.enableReformation && (
            <Grid
              container
              size={12}
              sx={{
                alignItems: 'center',
                ...centeredOnSmallScreen,
                fontSize: '1.25rem'
              }}>
              <CoupTypography
                component='span'
                addTextShadow
                sx={{ display: 'flex', alignItems: 'center', fontSize: 'inherit' }}
              >
                {t('treasury')}: <Treasury sx={{ mx: 1, verticalAlign: 'text-bottom', fontSize: 'inherit' }} /> {gameState.treasury}
              </CoupTypography>
            </Grid>
          )}
          <Grid size={12}>
            <RequestReset />
          </Grid>
          <Grid size={12}>
            <Forfeit />
          </Grid>
        </Grid>
      </Grid>
    </Grid >
  )
}

export default GameBoard
