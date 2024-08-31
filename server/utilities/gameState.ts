import { GameState, Influences } from '../../shared/types/game';
import { getValue, setValue } from './storage';

const gameStates: {
  [roomId: string]: GameState
} = {};

export const getGameState = async (roomId: string) => {
  if (!gameStates[roomId]) {
    gameStates[roomId] = JSON.parse(await getValue(roomId));
  }
  return {...gameStates[roomId]};
}

const setGameState = async (roomId: string, newState: GameState) => {
  const fifteenMinutes = 900;
  await setValue(roomId, JSON.stringify(newState), fifteenMinutes);
  gameStates[roomId] = newState;
}

const validateGameState = (state: GameState) => {
  if (state.players.length < 1 || state.players.length > 6) {
    throw new Error("Game state must always have 1 to 6 players");
  }
}

export const mutateGameState = async (
  roomId: string,
  mutation: (state: GameState) => void
) => {
  const gameState = await getGameState(roomId);
  mutation(gameState);
  validateGameState(gameState);
  await setGameState(roomId, gameState);
}

const buildDeck = () => {
  const cards: Influences[] = [];
  for (const influence of Object.values(Influences)) {
    cards.push(influence, influence, influence);
  }

  return {
    cards,
    getNextCard: () => cards.splice(
      Math.floor(Math.random() * cards.length),
      1
    )[0]
  }
}

export const createNewGame = async (roomId: string) => {
  await setGameState(roomId, {
    players: [],
    deck: buildDeck(),
    isStarted: false
  });
}
