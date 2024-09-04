import { Actions, GameState, Influences, Player, PublicGameState, PublicPlayer } from '../../shared/types/game';
import { getValue, setValue } from './storage';

// In-memory cache does not expire
// It is always refreshed if persistent storage is refreshed
const gameStates: {
  [roomId: string]: GameState
} = {};

export const getGameState = async (
  roomId: string
): Promise<GameState | null> => {
  if (!gameStates[roomId]) {
    gameStates[roomId] = JSON.parse(await getValue(roomId));
  }
  return gameStates[roomId] ? { ...gameStates[roomId] } : null;
}

export const getPublicGameState = async (
  roomId: string,
  playerId: string
): Promise<PublicGameState | null> => {
  const gameState = await getGameState(roomId);

  if (gameState === null) {
    return null;
  }

  let selfPlayer: Player;
  const publicPlayers: PublicPlayer[] = []
  gameState.players.forEach((player) => {
    publicPlayers.push({
      name: player.name,
      coins: player.coins,
      influenceCount: player.influences.length,
      color: player.color
    })
    if (player.id === playerId) {
      selfPlayer = player
    }
  })

  return {
    roomId: gameState.roomId,
    turnPlayer: gameState.turnPlayer,
    isStarted: gameState.isStarted,
    pendingAction: gameState.pendingAction,
    pendingActionChallenge: gameState.pendingActionChallenge,
    pendingBlock: gameState.pendingBlock,
    pendingBlockChallenge: gameState.pendingBlockChallenge,
    pendingInfluenceLoss: gameState.pendingInfluenceLoss,
    eventLogs: gameState.eventLogs,
    players: publicPlayers,
    selfPlayer
  };
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
  return gameState;
}

export const killPlayerInfluence = (state: GameState, playerName: string, putBackInDeck: boolean = false) => {
  state.pendingInfluenceLoss[playerName] = [
    ...(state.pendingInfluenceLoss[playerName] ?? []),
    { putBackInDeck }
  ];
}

const shuffle = <T>(array: T[]): T[] => {
  const unShuffled = [...array];
  const shuffled: T[] = [];

  while (unShuffled.length) {
    shuffled.push(unShuffled.splice(Math.floor(Math.random() * unShuffled.length), 1)[0])
  }

  return shuffled;
}

export const processPendingAction = async (state: GameState) => {
  const actionPlayer = state.players.find(({ name }) => name === state.turnPlayer);
  const targetPlayer = state.players.find(({ name }) => name === state.pendingAction.targetPlayer);
  if (state.pendingAction.action === Actions.Assassinate) {
    actionPlayer.coins -= 3;
    killPlayerInfluence(state, targetPlayer.name);
  } else if (state.pendingAction.action === Actions.Exchange) {
    actionPlayer.influences.push(drawCardFromDeck(state), drawCardFromDeck(state));
    state.deck = shuffle(state.deck);
    killPlayerInfluence(state, actionPlayer.name, true);
    killPlayerInfluence(state, actionPlayer.name, true);
  } else if (state.pendingAction.action === Actions.ForeignAid) {
    actionPlayer.coins += 2;
  } else if (state.pendingAction.action === Actions.Steal) {
    const coinsAvailable = Math.min(2, targetPlayer.coins);
    actionPlayer.coins += coinsAvailable;
    targetPlayer.coins -= coinsAvailable;
  } else if (state.pendingAction.action === Actions.Tax) {
    actionPlayer.coins += 3;
  }
  logEvent(state, `${actionPlayer.name} used ${state.pendingAction.action}${targetPlayer ? ` on ${targetPlayer.name}` : ''}`)
  delete state.pendingAction;
}

const buildShuffledDeck = () => {
  return shuffle(Object.values(Influences)
    .flatMap((influence) => Array.from({ length: 3 }, () => influence)));
}

export const drawCardFromDeck = (state: GameState) => {
  return state.deck.pop();
}

export const logEvent = (state: GameState, log: string) => {
  state.eventLogs.push(log);
  if (state.eventLogs.length > 100) {
    state.eventLogs.splice(0, 1);
  }
}

export const createNewGame = async (roomId: string) => {
  await setGameState(roomId, {
    roomId,
    players: [],
    deck: buildShuffledDeck(),
    pendingInfluenceLoss: {},
    isStarted: false,
    eventLogs: []
  });
}

export const resetGame = async (roomId: string) => {
  const newGameState = await getGameState(roomId);

  await createNewGame(roomId);
  return mutateGameState(roomId, (state) => {
    const newPlayers = shuffle(newGameState.players.map((player) => ({
      ...player,
      coins: 2,
      influences: Array.from({ length: 2 }, () => drawCardFromDeck(state))
    })));
    state.isStarted = true;
    state.players = newPlayers;
  });
}

export const addPlayerToGame = (roomId: string, playerId: string, playerName: string) => {
  return mutateGameState(roomId, (state) => {
    state.players.push({
      id: playerId,
      name: playerName,
      coins: 2,
      influences: Array.from({ length: 2 }, () => drawCardFromDeck(state)),
      color: ['#73C373', '#7AB8D3', '#DD6C75', '#8C6CE6', '#EA9158', '#CB8F8F', '#FFC303'][state.players.length]
    })
    return state;
  });
}

export const getNextPlayerTurn = (state: GameState) => {
  const currentIndex = state.players.findIndex((player) => player.name === state.turnPlayer);

  let nextIndex = currentIndex + 1;
  while (!state.players[nextIndex % state.players.length].influences) {
    if (nextIndex % state.players.length === currentIndex) {
      throw new Error('Unable to determine next player turn');
    }

    nextIndex++;
  }

  return state.players[nextIndex % state.players.length].name;
}
