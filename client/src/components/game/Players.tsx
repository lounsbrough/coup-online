import { Badge, Button, Grid, Paper, Tooltip, Typography, useTheme } from "@mui/material"
import { colord } from 'colord'
import { useGameStateContext } from "../../contexts/GameStateContext"
import { Close, MonetizationOn, ShieldTwoTone, WhatshotTwoTone } from "@mui/icons-material"
import OverflowTooltip from "../utilities/OverflowTooltip"
import InfluenceIcon from "../icons/InfluenceIcon"
import { LIGHT_COLOR_MODE } from "../../contexts/MaterialThemeContext"
import { getPlayerId, getWaitingOnPlayers } from "../../helpers/players"
import { Factions, PlayerActions } from "@shared"
import useGameMutation from "../../hooks/useGameMutation"
import Bot from "../icons/Bot"
import { useTranslationContext } from "../../contexts/TranslationsContext"

function Players({ inWaitingRoom = false }: Readonly<{ inWaitingRoom?: boolean }>) {
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()
  const theme = useTheme()

  const { trigger, isMutating } = useGameMutation<{
    roomId: string, playerId: string, playerName: string
  }>({ action: PlayerActions.removeFromGame })

  if (!gameState) {
    return null
  }

  const colorModeFactor = theme.palette.mode === LIGHT_COLOR_MODE ? -1 : 1
  const waitingOnPlayers = getWaitingOnPlayers(gameState)
  const humanPlayers = gameState.players.filter(({ ai }) => !ai)

  return (
    <Grid container justifyContent="center" spacing={3}>
      {gameState.players
        .map(({ name, color, coins, influenceCount, deadInfluences, ai, personality, faction }, index) => {
          const playerColor = gameState.isStarted && !influenceCount ? '#777777' : color
          const cardTextColor = theme.palette.mode === LIGHT_COLOR_MODE ? 'white' : 'black'
          const isWaitingOnPlayer = waitingOnPlayers.some(({ name: waitingOnName }) => waitingOnName === name)

          const influences = gameState.isStarted ? [
            ...deadInfluences,
            ...Array.from({ length: influenceCount }, () => undefined)
          ] : Array.from({ length: 2 }, () => undefined)

          const showKickBadge = inWaitingRoom && (ai || humanPlayers.length > 1) && !!gameState.selfPlayer
          const alivePlayers = gameState.players.filter((p) => p.influenceCount)
          const allSameFaction = alivePlayers.every((p) => p.faction === alivePlayers[0]?.faction)
          const showFactionBadge = !!faction && gameState.settings.enableReformation && !allSameFaction

          const kickBadgeContent = (
            <Button
              sx={{
                p: 0,
                height: '28px',
                width: '28px',
                minWidth: 'unset',
                borderRadius: '28px',
                background: color
              }}
              disabled={isMutating}
              variant="contained"
              onClick={() => {
                trigger({
                  roomId: gameState.roomId,
                  playerId: getPlayerId(),
                  playerName: name
                })
              }}
            >
              <Close />
            </Button>
          )

          const FactionIcon = faction === Factions.Loyalist ? ShieldTwoTone : WhatshotTwoTone

          return (
            <Badge
              key={index}
              invisible={!showKickBadge}
              badgeContent={kickBadgeContent}
            >
              <Paper
                elevation={isWaitingOnPlayer ? 5 : 1}
                sx={{
                  position: 'relative',
                  color: 'white',
                  alignContent: 'center',
                  background: playerColor,
                  borderRadius: 3,
                  p: 1,
                  width: theme.isLargeScreen ? '7rem' : '6rem',
                  transition: theme.transitions.create(['transform', 'box-shadow']),
                  animation: isWaitingOnPlayer ? 'pulsePlayer 1.5s infinite' : undefined,
                  "@keyframes pulsePlayer": {
                    "0%": { transform: 'scale(1)' },
                    "50%": { transform: 'scale(1.06)' },
                    "100%": { transform: 'scale(1)' }
                  },
                }}>
                {showFactionBadge && (
                  <Tooltip title={<Typography variant="h6">{t(faction!)}</Typography>}>
                    <FactionIcon sx={{
                      fontSize: '30px',
                      position: 'absolute',
                      top: '-12px',
                      left: '-12px',
                      color: 'white',
                    }} />
                  </Tooltip>
                )}
                <Typography variant="h6" sx={{
                  fontWeight: 'bold',
                  color: cardTextColor
                }}
                >
                  <OverflowTooltip>{name}</OverflowTooltip>
                </Typography>
                <Typography variant="h6" sx={{ color: cardTextColor }}>
                  {ai && (
                    <Tooltip title={
                      personality ? (
                        <>
                          <Typography>
                            {t('vengefulness')}
                            {`: ${personality?.vengefulness}`}%
                          </Typography>
                          <Typography>
                            {t('honesty')}
                            {`: ${personality?.honesty}`}%
                          </Typography>
                          <Typography>
                            {t('skepticism')}
                            {`: ${personality?.skepticism}`}%
                          </Typography>
                        </>
                      ) : (
                        <Typography>
                          {t('personalityIsHidden')}
                        </Typography>
                      )
                    }>
                      <Bot sx={{ verticalAlign: 'text-bottom' }} />
                    </Tooltip>
                  )}
                  <MonetizationOn sx={{ verticalAlign: 'text-bottom' }} />{` ${coins}`}
                </Typography>
                <Grid
                  container mt={0.5}
                  spacing={1}
                  justifyContent='center'
                  flexWrap="nowrap"
                >
                  {influences.map((influence, index) => {
                    return (
                      <Grid
                        key={index}
                        sx={{
                          justifyContent: 'center',
                          alignContent: 'center',
                          height: '44px',
                          width: '44px',
                          background: colord(playerColor).darken(colorModeFactor * 0.25).toHex(),
                          padding: 0.5,
                          borderRadius: 2
                        }}>
                        <Tooltip
                          title={
                            influence && (
                              <Typography variant="h6">
                                {t(influence)}
                              </Typography>
                            )
                          }
                        >
                          <span>
                            <InfluenceIcon sx={{ fontSize: '32px', color: colord(playerColor).lighten(colorModeFactor * 0.2).toHex() }} influence={influence} />
                          </span>
                        </Tooltip>
                      </Grid>
                    )
                  })}
                </Grid>
              </Paper>
            </Badge>
          )
        })}
    </Grid>
  )
}

export default Players
