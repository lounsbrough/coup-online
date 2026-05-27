import { useState } from 'react'
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import { ExpandMore, ExpandLess } from '@mui/icons-material'
import { TimelineEntry } from '@shared'
import { useGameStateContext } from '../../contexts/GameStateContext'
import { useTranslationContext } from '../../contexts/TranslationsContext'
import CoupTypography from '../utilities/CoupTypography'

function GameSummary() {
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()
  const theme = useTheme()
  const [expanded, setExpanded] = useState(true)

  if (!gameState?.gameTimeline?.length) {
    return null
  }

  const gameTimeline = gameState.gameTimeline
  const players = gameState.players
  const getPlayerColor = (playerName: string) =>
    players.find((p) => p.name === playerName)?.color ?? theme.palette.primary.main

  const successfulBluffs = gameTimeline.filter(
    (entry) => entry.isBluff && entry.outcome !== 'challenge_succeeded'
  )

  const soulReads = gameTimeline.filter(
    (entry) => entry.outcome === 'challenge_succeeded'
  )

  const longestBluffStreak = getLongestBluffStreak(gameTimeline)

  const slowpoke = getSlowestPlayer(gameTimeline)
  const speedDemon = getFastestPlayer(gameTimeline)

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mt: 3,
        background: theme.palette.mode === 'dark'
          ? 'rgba(0, 0, 0, 0.3)'
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(5px)',
        maxWidth: 600,
        mx: 'auto',
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(!expanded) } }}
      >
        <CoupTypography variant="h5" addTextShadow sx={{ fontWeight: 700 }}>
          {t('gameSummary')}
        </CoupTypography>
        <IconButton size="small" tabIndex={-1}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        {(successfulBluffs.length > 0 || soulReads.length > 0 || slowpoke || speedDemon) && (
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ my: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
            {successfulBluffs.length > 0 && (
              <Chip
                size="small"
                label={t('successfulBluffs', { count: successfulBluffs.length })}
                color="warning"
                variant="outlined"
              />
            )}
            {soulReads.length > 0 && (
              <Chip
                size="small"
                label={t('soulReads', { count: soulReads.length })}
                color="success"
                variant="outlined"
              />
            )}
            {longestBluffStreak && (
              <Chip
                size="small"
                label={t('longestBluffStreak', {
                  textVars: {
                    player: longestBluffStreak.player,
                    count: longestBluffStreak.count
                  }
                })}
                color="error"
                variant="outlined"
              />
            )}
            {slowpoke && (
              <Tooltip
                title={
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {t('averageWaitTime')}
                    </Typography>
                    {getPlayerWaitRanking(gameTimeline).map(({ player, avgMs }) => (
                      <Typography key={player} variant="caption">
                        {player}: {formatWaitTime(avgMs)}
                      </Typography>
                    ))}
                  </Stack>
                }
                arrow
              >
                <Stack direction="row" spacing={0.5}>
                  <Chip
                    size="small"
                    label={`🐌 ${slowpoke.player}: ${formatWaitTime(slowpoke.avgMs)}`}
                    color="error"
                    variant="outlined"
                  />
                  {speedDemon && (
                    <Chip
                      size="small"
                      label={`⚡ ${speedDemon.player}: ${formatWaitTime(speedDemon.avgMs)}`}
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Tooltip>
            )}
          </Stack>
        )}

        <Stack spacing={0.5} sx={{ mt: 1, maxHeight: '40vh', overflowY: 'auto' }}>
          {gameTimeline.map((entry, index) => (
            <TimelineRow
              key={index}
              entry={entry}
              getPlayerColor={getPlayerColor}
            />
          ))}
        </Stack>
      </Collapse>
    </Paper>
  )
}

function TimelineRow({ entry, getPlayerColor }: {
  entry: TimelineEntry
  getPlayerColor: (name: string) => string
}) {
  const { t } = useTranslationContext()
  const theme = useTheme()

  const showBluffLabel = entry.claimedInfluence !== undefined

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 0.75,
        px: 1.5,
        borderRadius: 1,
        background: entry.isBluff
          ? 'rgba(255, 152, 0, 0.08)'
          : 'rgba(76, 175, 80, 0.05)',
        borderLeft: `3px solid ${getPlayerColor(entry.player)}`,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
        <Typography variant="body2" component="span" sx={{ fontWeight: 600, color: getPlayerColor(entry.player) }}>
          {entry.player}
        </Typography>
        <Typography variant="body2" component="span">
          {' '}{t(entry.action)}
          {entry.targetPlayer && (
            <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: getPlayerColor(entry.targetPlayer) }}>
              {' → '}{entry.targetPlayer}
            </Typography>
          )}
        </Typography>

        {entry.claimedInfluence && (
          <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
            {t('claimedInfluence')}: {t(entry.claimedInfluence)}
            {' • '}{t('actualHand')}: {entry.actualHand.map((i) => t(i)).join(', ')}
          </Typography>
        )}

        {entry.challengedBy && (
          <Typography variant="caption" component="div" sx={{
            color: entry.outcome === 'challenge_succeeded'
              ? theme.palette.success.main
              : theme.palette.error.main,
            fontWeight: 600
          }}>
            {t('challengedBy', { textVars: { player: entry.challengedBy } })}
            {entry.outcome === 'challenge_succeeded'
              ? ' 🎯'
              : ` ${t('challengeFailed')}`
            }
          </Typography>
        )}

        {entry.blockedBy && (
          <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
            {t('blockedBy', { textVars: { player: entry.blockedBy } })}
            {entry.blockClaimedInfluence && ` (${t(entry.blockClaimedInfluence)})`}
            {entry.blockIsBluff && (
              <Chip
                component="span"
                label={t('bluff')}
                size="small"
                color="warning"
                variant="outlined"
                sx={{ ml: 0.5, height: 16, fontSize: '0.6rem' }}
              />
            )}
          </Typography>
        )}

        {entry.blockChallengedBy && (
          <Typography variant="caption" component="div" sx={{
            color: entry.outcome === 'block_challenged_succeeded'
              ? theme.palette.success.main
              : theme.palette.error.main,
            fontWeight: 600
          }}>
            {t('blockChallengedBy', { textVars: { player: entry.blockChallengedBy } })}
            {entry.outcome === 'block_challenged_succeeded'
              ? ' 🎯'
              : ` ${t('challengeFailed')}`
            }
          </Typography>
        )}

        {!entry.challengedBy && !entry.blockedBy && entry.claimedInfluence && entry.isBluff && (
          <Typography variant="caption" component="div" sx={{
            color: theme.palette.warning.main,
            fontStyle: 'italic'
          }}>
            {t('unchallenged')} 😏
          </Typography>
        )}
      </Box>

      <Box sx={{ minWidth: 60, display: 'flex', justifyContent: 'center' }}>
        {showBluffLabel && (
          <Chip
            label={entry.isBluff ? t('bluff') : t('truth')}
            size="small"
            color={entry.isBluff ? 'warning' : 'success'}
            variant={entry.isBluff ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
          />
        )}
      </Box>
    </Box>
  )
}

function getLongestBluffStreak(timeline: TimelineEntry[]): { player: string; count: number } | null {
  const playerStreaks: { [player: string]: number } = {}
  const maxStreaks: { [player: string]: number } = {}

  for (const entry of timeline) {
    if (entry.isBluff && entry.outcome !== 'challenge_succeeded') {
      playerStreaks[entry.player] = (playerStreaks[entry.player] ?? 0) + 1
      maxStreaks[entry.player] = Math.max(maxStreaks[entry.player] ?? 0, playerStreaks[entry.player])
    } else if (entry.claimedInfluence) {
      playerStreaks[entry.player] = 0
    }
  }

  let best: { player: string; count: number } | null = null
  for (const [player, count] of Object.entries(maxStreaks)) {
    if (count >= 2 && (!best || count > best.count)) {
      best = { player, count }
    }
  }
  return best
}

function getPlayerWaitAverages(timeline: TimelineEntry[]): { [player: string]: number } {
  const totals: { [player: string]: number } = {}
  const counts: { [player: string]: number } = {}
  for (const entry of timeline) {
    if (typeof entry.waitTimeMs === 'number') {
      totals[entry.player] = (totals[entry.player] ?? 0) + entry.waitTimeMs
      counts[entry.player] = (counts[entry.player] ?? 0) + 1
    }
  }
  const averages: { [player: string]: number } = {}
  for (const player of Object.keys(totals)) {
    averages[player] = totals[player] / counts[player]
  }
  return averages
}

function getPlayerWaitRanking(timeline: TimelineEntry[]): { player: string; avgMs: number }[] {
  const averages = getPlayerWaitAverages(timeline)
  return Object.entries(averages)
    .map(([player, avgMs]) => ({ player, avgMs }))
    .sort((a, b) => b.avgMs - a.avgMs)
}

function getSlowestPlayer(timeline: TimelineEntry[]): { player: string; avgMs: number } | null {
  const averages = getPlayerWaitAverages(timeline)
  let slowest: { player: string; avgMs: number } | null = null
  for (const [player, avgMs] of Object.entries(averages)) {
    if (!slowest || avgMs > slowest.avgMs) {
      slowest = { player, avgMs }
    }
  }
  return slowest
}

function getFastestPlayer(timeline: TimelineEntry[]): { player: string; avgMs: number } | null {
  const averages = getPlayerWaitAverages(timeline)
  const players = Object.keys(averages)
  if (players.length < 2) return null
  let fastest: { player: string; avgMs: number } | null = null
  for (const [player, avgMs] of Object.entries(averages)) {
    if (!fastest || avgMs < fastest.avgMs) {
      fastest = { player, avgMs }
    }
  }
  return fastest
}

function formatWaitTime(ms: number): string {
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

export default GameSummary
