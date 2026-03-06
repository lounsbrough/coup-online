import { ReactNode, useEffect, useState } from 'react'
import { useParams, Link as RouterLink } from 'react-router'
import {
  Avatar,
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
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
import {
  EmojiEvents,
  LocalFireDepartment,
  Person,
  Psychology,
  SportsKabaddi,
} from '@mui/icons-material'
import { UserStats } from '@shared'
import { getBaseUrl } from '../../helpers/api'
import { useTranslationContext } from '../../contexts/TranslationsContext'
import { useAuthContext } from '../../contexts/AuthContext'
import CoupTypography from '../utilities/CoupTypography'

function StatCard({ label, value, icon }: Readonly<{
  label: ReactNode
  value: ReactNode
  icon?: React.ReactNode
}>) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ textAlign: 'center', py: 2 }}>
        {icon && <Box sx={{ mb: 1 }}>{icon}</Box>}
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  )
}

function PercentBar({ label, value, total }: Readonly<{
  label: ReactNode
  value: number
  total: number
}>) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" fontWeight="bold">
          {pct}% ({value}/{total})
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  )
}

function Profile() {
  const { uid } = useParams<{ uid: string }>()
  const { t } = useTranslationContext()
  const { user } = useAuthContext()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!uid) return
    setLoading(true)
    setError(null)
    setNotFound(false)
    fetch(`${getBaseUrl()}/api/users/${uid}/stats`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true)
          return null
        }
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then((data) => setStats(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [uid])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Typography variant="h5">{t('profileNotFound')}</Typography>
        <Link component={RouterLink} to="/">{t('home')}</Link>
      </Box>
    )
  }

  if (notFound || !stats) {
    const isOwnProfile = user?.uid === uid
    return (
      <>
        <Breadcrumbs sx={{ m: 2 }} aria-label="breadcrumb">
          <Link component={RouterLink} to="/">{t('home')}</Link>
          <Typography>{t('profile')}</Typography>
        </Breadcrumbs>
        <Box sx={{ mt: 5, textAlign: 'center' }}>
          {isOwnProfile && user && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
              <Avatar
                {...(user.photoURL ? { src: user.photoURL } : {})}
                alt={user.displayName ?? ''}
                sx={{ width: 64, height: 64 }}
              >
                {user.displayName?.[0]?.toUpperCase() || <Person />}
              </Avatar>
              <CoupTypography variant="h4" addTextShadow>
                {user.displayName}
              </CoupTypography>
            </Box>
          )}
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {isOwnProfile ? t('noStatsYet') : t('profileNotFound')}
          </Typography>
          {isOwnProfile && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('playGameToTrackStats')}
            </Typography>
          )}
          <Link component={RouterLink} to="/">{t('home')}</Link>
        </Box>
      </>
    )
  }

  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0

  const sortedOpponents = Object.values(stats.opponents || {})
    .sort((a, b) => b.gamesPlayedTogether - a.gamesPlayedTogether)
    .slice(0, 10)

  return (
    <>
      <Breadcrumbs sx={{ m: 2 }} aria-label="breadcrumb">
        <Link component={RouterLink} to="/">{t('home')}</Link>
        <Typography>{t('profile')}</Typography>
      </Breadcrumbs>

      {/* Player header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 3 }}>
        <Avatar
          {...(stats.photoURL ? { src: stats.photoURL } : {})}
          alt={stats.displayName}
          sx={{ width: 64, height: 64 }}
        >
          {stats.displayName?.[0]?.toUpperCase() || <Person />}
        </Avatar>
        <Box>
          <CoupTypography variant="h4" addTextShadow>
            {stats.displayName}
          </CoupTypography>
          {stats.lastPlayedAt && (
            <Typography variant="body2" color="text.secondary">
              {t('lastPlayed')}: {new Date(stats.lastPlayedAt).toLocaleDateString()}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ maxWidth: 800, mx: 'auto', px: 2, mt: 4 }}>
        {/* Core Stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              label={t('gamesPlayed')}
              value={stats.gamesPlayed}
              icon={<SportsKabaddi color="primary" />}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              label={t('winRate')}
              value={`${winRate}%`}
              icon={<EmojiEvents sx={{ color: '#FFD700' }} />}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              label={t('currentStreak')}
              value={(() => {
                if (stats.currentWinStreak > 0) return `${stats.currentWinStreak}W`
                if (stats.currentLossStreak > 0) return `${stats.currentLossStreak}L`
                return '-'
              })()}
              icon={<LocalFireDepartment color="error" />}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              label={t('longestWinStreak')}
              value={stats.longestWinStreak}
              icon={<LocalFireDepartment sx={{ color: '#FFD700' }} />}
            />
          </Grid>
        </Grid>

        {/* Win/Loss */}
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>{t('record')}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
              <Box textAlign="center">
                <Typography variant="h3" color="success.main" fontWeight="bold">
                  {stats.gamesWon}
                </Typography>
                <Typography variant="body2" color="text.secondary">{t('wins')}</Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box textAlign="center">
                <Typography variant="h3" color="error.main" fontWeight="bold">
                  {stats.gamesLost}
                </Typography>
                <Typography variant="body2" color="text.secondary">{t('losses')}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Playstyle */}
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Psychology color="primary" />
              <Typography variant="h6">{t('playstyle')}</Typography>
            </Box>
            <PercentBar
              label={t('bluffSuccessRate')}
              value={stats.successfulBluffs}
              total={stats.totalBluffs}
            />
            <PercentBar
              label={t('challengeAccuracy')}
              value={stats.successfulChallengesMade}
              total={stats.totalChallengesMade}
            />
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }}>
                <Box textAlign="center">
                  <Typography variant="h5" fontWeight="bold">{stats.totalAssassinations}</Typography>
                  <Typography variant="body2" color="text.secondary">{t('assassinations')}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Box textAlign="center">
                  <Typography variant="h5" fontWeight="bold">{stats.totalCoups}</Typography>
                  <Typography variant="body2" color="text.secondary">{t('coups')}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Box textAlign="center">
                  <Typography variant="h5" fontWeight="bold">{stats.totalSteals}</Typography>
                  <Typography variant="body2" color="text.secondary">{t('steals')}</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <EmojiEvents sx={{ color: '#FFD700' }} />
              <Typography variant="h6">{t('achievements')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {stats.gamesWonWithoutBluffing > 0 && (
                <Chip
                  label={`${t('honestVictories')}: ${stats.gamesWonWithoutBluffing}`}
                  color="success"
                  variant="outlined"
                />
              )}
              {stats.gamesWonAfterLosingFirstInfluence > 0 && (
                <Chip
                  label={`${t('comebacks')}: ${stats.gamesWonAfterLosingFirstInfluence}`}
                  color="warning"
                  variant="outlined"
                />
              )}
              {stats.fewestTurnsToWin != null && (
                <Chip
                  label={`${t('fastestWin')}: ${stats.fewestTurnsToWin} ${t('turns')}`}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
            {stats.gamesWonWithoutBluffing === 0
              && stats.gamesWonAfterLosingFirstInfluence === 0
              && stats.fewestTurnsToWin == null && (
                <Typography variant="body2" color="text.secondary">
                  {t('noAchievementsYet')}
                </Typography>
              )}
          </CardContent>
        </Card>

        {/* Head-to-Head */}
        {sortedOpponents.length > 0 && (
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SportsKabaddi color="primary" />
                <Typography variant="h6">{t('headToHead')}</Typography>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('opponent')}</TableCell>
                      <TableCell align="center">{t('gamesPlayed')}</TableCell>
                      <TableCell align="center">{t('wins')}</TableCell>
                      <TableCell align="center">{t('losses')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedOpponents.map((opp) => (
                      <TableRow key={opp.displayName}>
                        <TableCell>{opp.displayName}</TableCell>
                        <TableCell align="center">{opp.gamesPlayedTogether}</TableCell>
                        <TableCell align="center">{opp.winsAgainst}</TableCell>
                        <TableCell align="center">{opp.lossesAgainst}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Link component={RouterLink} to="/leaderboard">
            {t('viewLeaderboard')}
          </Link>
        </Box>
      </Box>
    </>
  )
}

export default Profile
