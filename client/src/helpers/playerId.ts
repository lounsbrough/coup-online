import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

export const getPlayerId = () => {
  const cookieName = 'coupPlayerId';

  const existingPlayerId = Cookies.get(cookieName);
  if (existingPlayerId) {
    return existingPlayerId;
  }

  const playerId = uuidv4();
  Cookies.set(cookieName, playerId);
  return playerId;
}
