import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

export const getPlayerId = () => {
  let playerId = Cookies.get('coupGamePlayerId');
  if (!playerId) {
    playerId = uuidv4();
    Cookies.set('coupGamePlayerId', playerId);
  }
  return playerId;
}
