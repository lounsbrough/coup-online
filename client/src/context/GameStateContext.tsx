import { useState, createContext, useContext, ReactNode } from 'react';
import useSWR from 'swr';
import { PublicGameState } from '../shared/types/game';
import { getPlayerId } from '../helpers/playerId';
import { Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

type GameStateContextType = {
  gameState?: PublicGameState,
  setGameState: (newGameState: PublicGameState) => void
}

export const GameStateContext = createContext<GameStateContextType>({
  setGameState: () => { }
});

export function GameStateContextProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<PublicGameState>();
  const [searchParams] = useSearchParams();

  const roomId = searchParams.get('roomId');

  const { error } = useSWR<void, Error>(
    `${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8000'}/gameState?roomId=${roomId}&playerId=${getPlayerId()}`,
    async function (input: RequestInfo, init?: RequestInit) {
      const res = await fetch(input, init);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Game not found, please return home')
        } else {
          throw new Error('Unknown error fetching game state')
        }
      }

      const newState = await res.json();

      if (JSON.stringify(newState) !== JSON.stringify(gameState)) {
        setGameState(newState);
      }
    },
    { refreshInterval: 1000 }
  );

  const contextValue = {
    gameState,
    setGameState
  };

  return (
    <GameStateContext.Provider value={contextValue}>
      {!!error && <Typography color='error' sx={{ m: 5 }}>{error.message}</Typography>}
      {children}
    </GameStateContext.Provider>
  );
}

export const useGameStateContext = () => useContext(GameStateContext);
