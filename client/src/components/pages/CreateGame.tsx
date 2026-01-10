import { useCallback, useState } from 'react';
import {
  Box,
  Breadcrumbs,
  Button,
  Grid,
  Link,
  Slider,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { AddCircle, Person } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router';
import { getPlayerId } from '../../helpers/players';
import { Analytics } from '@vercel/analytics/react';
import {
  GameSettings,
  PlayerActions,
  DehydratedPublicGameState,
} from '@shared';
import useGameMutation from '../../hooks/useGameMutation';
import { useTranslationContext } from '../../contexts/TranslationsContext';
import {
  allowReviveStorageKey,
  eventLogRetentionTurnsStorageKey,
  speedRoundEnabledStorageKey,
  speedRoundSecondsStorageKey,
} from '../../helpers/localStorageKeys';
import CoupTypography from '../utilities/CoupTypography';
import { usePersistedState } from '../../hooks/usePersistedState';

function CreateGame() {
  const [playerName, setPlayerName] = useState('');
  const [eventLogRetentionTurns, setEventLogRetentionTurns] = usePersistedState<number>(eventLogRetentionTurnsStorageKey, 3);
  const [allowRevive, setAllowRevive] = usePersistedState<boolean>(allowReviveStorageKey, false);
  const [speedRoundEnabled, setSpeedRoundEnabled] = usePersistedState<boolean>(speedRoundEnabledStorageKey, false);
  const [speedRoundSeconds, setSpeedRoundSeconds] = usePersistedState<number>(speedRoundSecondsStorageKey, 10);
  const navigate = useNavigate();
  const { t } = useTranslationContext();

  const navigateToRoom = useCallback(
    (gameState: DehydratedPublicGameState) => {
      navigate(`/game?roomId=${gameState.roomId}`);
    },
    [navigate]
  );

  const { trigger, isMutating } = useGameMutation<{
    playerId: string;
    playerName: string;
    settings: GameSettings;
  }>({ action: PlayerActions.createGame, callback: navigateToRoom });

  return (
    <>
      <Analytics />
      <Breadcrumbs sx={{ m: 2 }} aria-label="breadcrumb">
        <Link component={RouterLink} to="/">
          {t('home')}
        </Link>
        <Typography>{t('createNewGame')}</Typography>
      </Breadcrumbs>
      <CoupTypography variant="h5" sx={{ m: 5 }} addTextShadow>
        {t('createNewGame')}
      </CoupTypography>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          trigger({
            playerId: getPlayerId(),
            playerName: playerName.trim(),
            settings: {
              eventLogRetentionTurns,
              allowRevive,
              ...(speedRoundEnabled && { speedRoundSeconds }),
            },
          });
        }}
      >
        <Grid container direction="column" alignItems="center">
          <Grid>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 3 }}>
              <Person sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
              <TextField
                data-testid="playerNameInput"
                value={playerName}
                onChange={(event) => {
                  setPlayerName(event.target.value.slice(0, 10));
                }}
                label={t('whatIsYourName')}
                variant="standard"
                required
              />
            </Box>
          </Grid>
          <Grid sx={{ maxWidth: '300px', width: '90%' }}>
            <Box mt={6}>
              <CoupTypography mt={2} addTextShadow>
                {t('eventLogRetentionTurns')}
                {`: ${eventLogRetentionTurns}`}
              </CoupTypography>
              <Slider
                data-testid="eventLogRetentionTurnsInput"
                step={1}
                value={eventLogRetentionTurns}
                valueLabelDisplay="auto"
                min={1}
                max={100}
                onChange={(_: Event, value: number) => {
                  setEventLogRetentionTurns(value);
                }}
              />
            </Box>
          </Grid>
          <Grid sx={{ maxWidth: '300px', width: '90%' }}>
            <Box mt={2}>
              <CoupTypography component="span" mt={2} addTextShadow>
                {t('allowRevive')}:
              </CoupTypography>
              <Switch
                checked={allowRevive}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setAllowRevive(event.target.checked);
                }}
                slotProps={{ input: { 'aria-label': 'controlled' } }}
              />
            </Box>
          </Grid>
          <Grid sx={{ maxWidth: '300px', width: '90%' }}>
            <Box mt={2}>
              <CoupTypography component="span" mt={2} addTextShadow>
                {t('speedRound')}:
              </CoupTypography>
              <Switch
                checked={speedRoundEnabled}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setSpeedRoundEnabled(event.target.checked);
                }}
                slotProps={{ input: { 'aria-label': 'controlled' } }}
              />
            </Box>
          </Grid>
          {speedRoundEnabled && (
            <Grid sx={{ maxWidth: '300px', width: '90%' }}>
              <Box mt={2}>
                <CoupTypography mt={2} addTextShadow>
                  {t('speedRoundSeconds')}
                  {`: ${speedRoundSeconds}`}
                </CoupTypography>
                <Slider
                  data-testid="speedRoundSecondsInput"
                  step={1}
                  value={speedRoundSeconds}
                  valueLabelDisplay="auto"
                  min={1}
                  max={60}
                  onChange={(_: Event, value: number) => {
                    setSpeedRoundSeconds(value);
                  }}
                />
              </Box>
            </Grid>
          )}
        </Grid>
        <Grid>
          <Button
            type="submit"
            sx={{ mt: 5 }}
            variant="contained"
            loading={isMutating}
            startIcon={<AddCircle />}
          >
            {t('createGame')}
          </Button>
        </Grid>
      </form>
    </>
  );
}

export default CreateGame;
