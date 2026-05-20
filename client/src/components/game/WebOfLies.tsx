import { useState } from 'react'
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { ExpandMore, ExpandLess } from '@mui/icons-material'
import { ActionAttributes, TimelineEntry } from '@shared'
import { useGameStateContext } from '../../contexts/GameStateContext'
import { useTranslationContext } from '../../contexts/TranslationsContext'
import CoupTypography from '../utilities/CoupTypography'

function WebOfLies() {
  const { gameState } = useGameStateContext()
  const { t } = useTranslationContext()
  const theme = useTheme()
  const [expanded, setExpanded] = useState(true)

  if (!gameState?.gameTimeline?.length) {
    return null
  }

  const players = gameState.players
  const getPlayerColor = (playerName: string) =>
    players.find((p) => p.name === playerName)?.color ?? theme.palette.primary.main

  const successfulBluffs = gameState.gameTimeline.filter(
    (entry) => entry.isBluff && entry.outcome !== 'challenge_succeeded'
  )

  const soulReads = gameState.gameTimeline.filter(
    (entry) => entry.outcome === 'challenge_succeeded'
  )

  const longestBluffStreak = getLongestBluffStreak(gameState.gameTimeline)

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
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <CoupTypography variant="h5" addTextShadow sx={{ fontWeight: 700 }}>
          {t('webOfLies')}
        </CoupTypography>
        <IconButton size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        {(successfulBluffs.length > 0 || soulReads.length > 0) && (
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
          </Stack>
        )}

        <Stack spacing={0.5} sx={{ mt: 1, maxHeight: '40vh', overflowY: 'auto' }}>
          {gameState.gameTimeline.map((entry, index) => (
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

  const influenceRequired = ActionAttributes[entry.action].influenceRequired
  const showBluffLabel = influenceRequired !== undefined

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 0.75,
        borderRadius: 1,
        background: entry.isBluff
          ? 'rgba(255, 152, 0, 0.08)'
          : 'rgba(76, 175, 80, 0.05)',
        borderLeft: `3px solid ${getPlayerColor(entry.player)}`,
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 28 }}>
        T{entry.turn}
      </Typography>

      <Box sx={{ flex: 1, minWidth: 0 }}>
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

export default WebOfLies
