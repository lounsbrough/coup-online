import { ReactNode, useEffect, useState } from 'react'
import { useParams, Link as RouterLink } from 'react-router'
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
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
  TextField,
  Typography,
} from '@mui/material'
import {
  AddCircle,
  Edit,
  EmojiEvents,
  GroupAdd,
  Home,
  LocalFireDepartment,
  Person,
  Psychology,
  Save,
  SportsKabaddi,
} from '@mui/icons-material'
import { UserStats } from '@shared'
import { getBaseUrl } from '../../helpers/api'
import { COUP_GOLD } from '../../helpers/styles'
import { useTranslationContext } from '../../contexts/TranslationsContext'
import { useAuthContext } from '../../contexts/AuthContext'
import CoupTypography from '../utilities/CoupTypography'
import { useDisplayName } from '../../hooks/useDisplayName'
import { Translations } from '../../i18n/translations'

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
        <CoupTypography addTextShadow variant="body2">{label}</CoupTypography>
        <CoupTypography addTextShadow variant="body2" fontWeight="bold">
          {pct}% ({value}/{total})
        </CoupTypography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  )
}

function DisplayNameEditor({
  profileName,
  profileNameLoading,
  isEditingName,
  editNameValue,
  editNameError,
  editNameSaving,
  t,
  onStartEdit,
  onChangeValue,
  onSave,
  onCancel,
}: Readonly<{
  profileName: string | null
  profileNameLoading: boolean
  isEditingName: boolean
  editNameValue: string
  editNameError: ReactNode
  editNameSaving: boolean
  t: (key: keyof Translations) => ReactNode
  onStartEdit: () => void
  onChangeValue: (val: string) => void
  onSave: () => void
  onCancel: () => void
}>) {
  if (profileNameLoading) return null

  if (isEditingName) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
        <TextField
          size="small"
          value={editNameValue}
          onChange={(e) => onChangeValue(e.target.value)}
          label={t('displayName')}
          variant="outlined"
          error={!!editNameError}
          helperText={editNameError}
          slotProps={{ htmlInput: { maxLength: 10 } }}
          autoFocus
        />
        <Button
          variant="contained"
          onClick={onSave}
          loading={editNameSaving}
          startIcon={<Save />}
          disabled={editNameValue.trim().length === 0}
        >
          {t('save')}
        </Button>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={editNameSaving}
        >
          {t('cancel')}
        </Button>
      </Box>
    )
  }

  return (
    <Button
      startIcon={<Edit />}
      onClick={onStartEdit}
      variant='outlined'
    >
      {profileName ? t('changeDisplayName') : t('setDisplayName')}
    </Button>
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
  const isOwnProfile = user?.uid === uid
  const { displayName: profileName, saveDisplayName, loading: profileNameLoading } = useDisplayName()
  const [isEditingName, setIsEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState('')
  const [editNameError, setEditNameError] = useState<ReactNode>(null)
  const [editNameSaving, setEditNameSaving] = useState(false)

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
        <CoupTypography addTextShadow variant="h4">{t('profileNotFound')}</CoupTypography>
        <Button
          sx={{ mt: 3 }}
          variant="contained"
          component={RouterLink}
          to="/"
          startIcon={<Home />}
        >{t('home')}</Button>
      </Box>
    )
  }

  if (notFound || !stats) {
    const isOwnProfile = user?.uid === uid
    return (
      <>
        <Breadcrumbs sx={{ m: 2 }} aria-label="breadcrumb">
          <Link component={RouterLink} to="/">{t('home')}</Link>
          <CoupTypography addTextShadow>{t('profile')}</CoupTypography>
        </Breadcrumbs>
        <Box sx={{ mt: 5, textAlign: 'center' }}>
          {isOwnProfile && user && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  {...(user.photoURL ? { src: user.photoURL } : {})}
                  alt={user.displayName ?? ''}
                  sx={{ width: 64, height: 64 }}
                >
                  {user.displayName?.[0]?.toUpperCase() || <Person />}
                </Avatar>
                <CoupTypography variant="h4" addTextShadow>
                  {profileName ?? user.displayName}
                </CoupTypography>
              </Box>
              <DisplayNameEditor
                profileName={profileName}
                profileNameLoading={profileNameLoading}
                isEditingName={isEditingName}
                editNameValue={editNameValue}
                editNameError={editNameError}
                editNameSaving={editNameSaving}
                t={t}
                onStartEdit={() => {
                  setEditNameValue(profileName ?? user.displayName?.slice(0, 10) ?? '')
                  setEditNameError(null)
                  setIsEditingName(true)
                }}
                onChangeValue={(val) => setEditNameValue(val.slice(0, 10))}
                onSave={async () => {
                  setEditNameSaving(true)
                  setEditNameError(null)
                  const result = await saveDisplayName(editNameValue)
                  setEditNameSaving(false)
                  if (result.success) {
                    setIsEditingName(false)
                  } else {
                    const knownErrors = ['inappropriateDisplayName', 'displayNameTaken'] as const
                    setEditNameError(knownErrors.includes(result.error as typeof knownErrors[number])
                      ? t(result.error as typeof knownErrors[number])
                      : t('somethingWentWrong'))
                  }
                }}
                onCancel={() => setIsEditingName(false)}
              />
            </>
          )}
          <CoupTypography addTextShadow variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {isOwnProfile ? t('noStatsYet') : t('profileNotFound')}
          </CoupTypography>
          {isOwnProfile && (
            <CoupTypography addTextShadow variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('playGameToTrackStats')}
            </CoupTypography>
          )}
          <Grid container direction="column" alignItems="center" spacing={5} sx={{ mt: 5 }}>
            <Grid>
              <Button
                variant="contained"
                component={RouterLink}
                to="/create-game"
                startIcon={<AddCircle />}
              >{t('createNewGame')}</Button>
            </Grid>
            <Grid>
              <Button
                variant="contained"
                component={RouterLink}
                to="/join-game"
                startIcon={<GroupAdd />}
              >{t('joinExistingGame')}</Button>
            </Grid>
          </Grid>
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
        <CoupTypography addTextShadow>{t('profile')}</CoupTypography>
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
            <CoupTypography addTextShadow variant="body2" color="text.secondary">
              {t('lastPlayed')}: {new Date(stats.lastPlayedAt).toLocaleDateString()}
            </CoupTypography>
          )}
        </Box>
      </Box>

      {isOwnProfile && user && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <DisplayNameEditor
            profileName={profileName}
            profileNameLoading={profileNameLoading}
            isEditingName={isEditingName}
            editNameValue={editNameValue}
            editNameError={editNameError}
            editNameSaving={editNameSaving}
            t={t}
            onStartEdit={() => {
              setEditNameValue(profileName ?? stats.displayName ?? '')
              setEditNameError(null)
              setIsEditingName(true)
            }}
            onChangeValue={(val) => setEditNameValue(val.slice(0, 10))}
            onSave={async () => {
              setEditNameSaving(true)
              setEditNameError(null)
              const result = await saveDisplayName(editNameValue)
              setEditNameSaving(false)
              if (result.success) {
                setIsEditingName(false)
                setStats((prev) => prev ? { ...prev, displayName: editNameValue.trim().slice(0, 10) } : prev)
              } else {
                const knownErrors = ['inappropriateDisplayName', 'displayNameTaken'] as const
                setEditNameError(knownErrors.includes(result.error as typeof knownErrors[number])
                  ? t(result.error as typeof knownErrors[number])
                  : t('somethingWentWrong'))
              }
            }}
            onCancel={() => setIsEditingName(false)}
          />
        </Box>
      )}

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
              icon={<EmojiEvents sx={{ color: COUP_GOLD }} />}
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
              icon={<LocalFireDepartment sx={{ color: COUP_GOLD }} />}
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
              <EmojiEvents sx={{ color: COUP_GOLD }} />
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
          <Button variant='contained' component={RouterLink} to="/leaderboard">
            {t('viewLeaderboard')}
          </Button>
        </Box>
      </Box>
    </>
  )
}

export default Profile
