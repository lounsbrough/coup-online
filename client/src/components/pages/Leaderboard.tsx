import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router'
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import { EmojiEvents, Google, Info, Person } from '@mui/icons-material'
import { LeaderboardEntry, LeaderboardResponse, RankedLeaderboardEntry } from '@shared'
import { getBaseUrl } from '../../helpers/api'
import { COUP_GOLD } from '../../helpers/styles'
import { useTranslationContext } from '../../contexts/TranslationsContext'
import { useAuthContext } from '../../contexts/AuthContext'
import CoupTypography from '../utilities/CoupTypography'

function getMedalColor(rank: number): string | undefined {
  if (rank === 1) return COUP_GOLD
  if (rank === 2) return '#C0C0C0'
  if (rank === 3) return '#CD7F32'
  return undefined
}

function Leaderboard() {
  const { t } = useTranslationContext()
  const { user, loading: authLoading, signInWithGoogle } = useAuthContext()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [userEntry, setUserEntry] = useState<RankedLeaderboardEntry | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (authLoading) return
    setLoading(true)
    setError(false)
    const params = new URLSearchParams({ minGames: '1', limit: '50' })
    if (user?.uid) params.set('uid', user.uid)
    fetch(`${getBaseUrl()}/api/leaderboard?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then((data: LeaderboardResponse) => {
        setEntries(data.entries)
        setUserEntry(data.userEntry)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [authLoading, user?.uid])

  return (
    <>
      <CoupTypography variant="h4" sx={{ m: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }} addTextShadow>
        <EmojiEvents fontSize="large" sx={{ mr: 1, color: COUP_GOLD }} />
        {t('leaderboard')}
      </CoupTypography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress size={50} sx={{ mb: 2 }} />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 3, textAlign: 'center' }}>
          {t('somethingWentWrong')}
        </Typography>
      )}

      {!loading && !error && entries.length === 0 && (
        <CoupTypography addTextShadow variant='h5' sx={{ mt: 3, textAlign: 'center' }} color="text.secondary">
          {t('noLeaderboardData')}
        </CoupTypography>
      )}

      {!authLoading && !user && (
        <Box sx={{ mt: 2, mb: 7, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <CoupTypography addTextShadow color="text.secondary">
            {t('signInToTrackStats')}
          </CoupTypography>
          <Button
            variant="contained"
            startIcon={<Google />}
            sx={{ whiteSpace: 'nowrap' }}
            onClick={() => { signInWithGoogle().catch(console.error) }}
          >
            {t('signIn')}
          </Button>
        </Box>
      )}

      {!loading && !error && entries.length > 0 && (
        <Box sx={{ maxWidth: { xs: 800, md: 1400 }, width: '100%', mx: 'auto', px: 2, mb: 4 }}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ width: 60 }}>#</TableCell>
                  <TableCell>{t('player')}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      {t('rating')}
                      <Tooltip
                        title={t('ratingExplanation')}
                        arrow
                        enterTouchDelay={0}
                        leaveTouchDelay={5000}
                      >
                        <Info sx={{ fontSize: 16, opacity: 0.6, cursor: 'help' }} />
                      </Tooltip>
                    </Box>
                  </TableCell>
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
                  const isCurrentUser = entry.uid === user?.uid
                  return (
                    <TableRow
                      key={entry.uid}
                      sx={{
                        ...(medalColor ? { backgroundColor: `${medalColor}11` } : {}),
                        ...(isCurrentUser ? { backgroundColor: 'action.selected' } : {}),
                      }}
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
                            {...(isCurrentUser ? { fontWeight: 'bold' } : {})}
                          >
                            {entry.displayName}
                          </Link>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="bold">
                          {entry.rating}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {Math.round(entry.winRate * 100)}%
                      </TableCell>
                      <TableCell align="center">{entry.gamesPlayed}</TableCell>
                      <TableCell align="center">
                        {entry.gamesWon}/{entry.gamesLost}
                      </TableCell>
                      <TableCell align="center">{entry.longestWinStreak}</TableCell>
                    </TableRow>
                  )
                })}
                {userEntry && (
                  <>
                    <TableRow>
                      <TableCell colSpan={7} sx={{ p: 0 }}>
                        <Divider>
                          <Typography variant="caption" color="text.secondary">
                            {t('yourRanking')}
                          </Typography>
                        </Divider>
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: 'action.selected' }}>
                      <TableCell align="center">
                        <Typography variant="body2">{userEntry.rank}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            {...(userEntry.photoURL ? { src: userEntry.photoURL } : {})}
                            alt={userEntry.displayName}
                            sx={{ width: 28, height: 28 }}
                          >
                            {userEntry.displayName?.[0]?.toUpperCase() || <Person />}
                          </Avatar>
                          <Link
                            component={RouterLink}
                            to={`/profile/${userEntry.uid}`}
                            underline="hover"
                            fontWeight="bold"
                          >
                            {userEntry.displayName}
                          </Link>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="bold">
                          {userEntry.rating}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {Math.round(userEntry.winRate * 100)}%
                      </TableCell>
                      <TableCell align="center">{userEntry.gamesPlayed}</TableCell>
                      <TableCell align="center">
                        {userEntry.gamesWon}/{userEntry.gamesLost}
                      </TableCell>
                      <TableCell align="center">{userEntry.longestWinStreak}</TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {user && !userEntry && !entries.some((e) => e.uid === user.uid) && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              {t('notEnoughGames')}
            </Typography>
          )}
        </Box>
      )}
    </>
  )
}

export default Leaderboard
