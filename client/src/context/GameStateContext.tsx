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

  async function fetcher(
    input: RequestInfo,
    init?: RequestInit
  ): Promise<PublicGameState> {
    const res = await fetch(input, init);

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Game not found, please return home')
      } else {
        throw new Error('Unknown error fetching game state')
      }
    }

    const state = await res.json() as PublicGameState;

    setGameState(state);

    return state;
  }

  const { error } = useSWR<PublicGameState, Error>(
    `${process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8000'}/gameState?roomId=${roomId}&playerId=${getPlayerId()}`,
    fetcher,
    { refreshInterval: 1000 }
  );

  const contextValue = {
    gameState,
    setGameState
  }

  return (
    <GameStateContext.Provider value={contextValue}>
      {!!error && <Typography>{error.message}</Typography>}
      {children}
    </GameStateContext.Provider>
  );
}

export const useGameStateContext = () => useContext(GameStateContext);
