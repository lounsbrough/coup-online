import { v4 as uuidv4 } from 'uuid';

export const getPlayerId = () => {
  const storageKey = 'coupPlayerId';

  const existingPlayerId = localStorage.getItem(storageKey);
  if (existingPlayerId) {
    return existingPlayerId;
  }

  const playerId = uuidv4();
  localStorage.setItem(storageKey, playerId);
  return playerId;
}
