import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router'
import {
  Avatar,
  Box,
  CircularProgress,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { EmojiEvents, Person } from '@mui/icons-material'
import { LeaderboardEntry } from '@shared'
import { getBaseUrl } from '../../helpers/api'
import { COUP_GOLD } from '../../helpers/styles'
import { useTranslationContext } from '../../contexts/TranslationsContext'
import { useAuthContext } from '../../contexts/AuthContext'
import CoupTypography from '../utilities/CoupTypography'
import LoginButton from '../LoginButton'

function getMedalColor(rank: number): string | undefined {
  if (rank === 1) return COUP_GOLD
  if (rank === 2) return '#C0C0C0'
  if (rank === 3) return '#CD7F32'
  return undefined
}

function Leaderboard() {
  const { t } = useTranslationContext()
  const { user, loading: authLoading } = useAuthContext()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`${getBaseUrl()}/api/leaderboard?minGames=3&limit=50`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then((data) => setEntries(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <CoupTypography variant="h4" sx={{ m: 5 }} addTextShadow>
        <EmojiEvents fontSize="large" sx={{ verticalAlign: 'middle', mr: 1, color: COUP_GOLD }} />
        {t('leaderboard')}
      </CoupTypography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 3, textAlign: 'center' }}>
          {error}
        </Typography>
      )}

      {!loading && !error && entries.length === 0 && (
        <CoupTypography addTextShadow variant='h5' sx={{ mt: 3, textAlign: 'center' }} color="text.secondary">
          {t('noLeaderboardData')}
        </CoupTypography>
      )}

      {!authLoading && !user && (
        <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          <CoupTypography addTextShadow color="text.secondary">
            {t('signInToTrackStats')}
          </CoupTypography>
          <LoginButton buttonProps={{ variant: 'contained' }} />
        </Box>
      )}

      {!loading && !error && entries.length > 0 && (
        <Box sx={{ maxWidth: 800, width: '100%', mx: 'auto', px: 2, mb: 4 }}>
          <TableContainer component={Paper} variant="outlined">
            <Table sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ width: 60 }}>#</TableCell>
                  <TableCell>{t('player')}</TableCell>
                  <TableCell align="center">{t('winRate')}</TableCell>
                  <TableCell align="center">{t('gamesPlayed')}</TableCell>
                  <TableCell align="center">{t('wins')}/{t('losses')}</TableCell>
                  <TableCell align="center">{t('bestStreak')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map((entry, index) => {
                  const rank = index + 1
                  const medalColor = getMedalColor(rank)
                  return (
                    <TableRow
                      key={entry.uid}
                      sx={medalColor ? {
                        backgroundColor: `${medalColor}11`,
                      } : {}}
                    >
                      <TableCell align="center">
                        {medalColor ? (
                          <EmojiEvents sx={{ color: medalColor, fontSize: 20 }} />
                        ) : (
                          <Typography variant="body2">{rank}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            {...(entry.photoURL ? { src: entry.photoURL } : {})}
                            alt={entry.displayName}
                            sx={{ width: 28, height: 28 }}
                          >
                            {entry.displayName?.[0]?.toUpperCase() || <Person />}
                          </Avatar>
                          <Link
                            component={RouterLink}
                            to={`/profile/${entry.uid}`}
                            underline="hover"
                          >
                            {entry.displayName}
                          </Link>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="bold">
                          {Math.round(entry.winRate * 100)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{entry.gamesPlayed}</TableCell>
                      <TableCell align="center">
                        {entry.gamesWon}/{entry.gamesLost}
                      </TableCell>
                      <TableCell align="center">{entry.longestWinStreak}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </>
  )
}

export default Leaderboard
