import Chance from 'chance'
import { DehydratedGameState, DehydratedPlayer, EventMessages, Influences } from '../../../shared/types/game'
import { MAX_PLAYER_COUNT } from '../../../shared/helpers/playerCount'
import { shuffle } from '../../../server/src/utilities/array'
import { getCountOfEachInfluence } from '../../../server/src/utilities/deck'

const chance = new Chance()

export const getGameState = ({ players }: { players: DehydratedPlayer[] }) => {
  const gameState: DehydratedGameState = {
    deck: shuffle(Object.values(Influences)
      .flatMap((influence) => Array.from({ length: getCountOfEachInfluence(players.length) }, () => influence))),
    eventLogs: chance.n(() => ({
      event: chance.pickone(Object.values(EventMessages)),
      turn: 1
    }), chance.natural({max: 10, min: 2})),
    chatMessages: chance.n(() => ({
      id: chance.guid(),
      from: chance.pickone(players).name,
      text: chance.sentence(),
      deleted: false,
      timestamp: chance.date().toISOString()
    }), chance.natural({max: 10, min: 2})),
    isStarted: chance.bool(),
    availablePlayerColors: chance.n(chance.color, MAX_PLAYER_COUNT),
    players: [],
    pendingInfluenceLoss: {},
    lastEventTimestamp: chance.date().toISOString(),
    roomId: chance.string(),
    settings: { eventLogRetentionTurns: 100, allowRevive: true },
    turn: chance.natural()
  }

  players.forEach(({ influences }) => {
    influences.forEach((influence) => {
      gameState.deck.splice(
        gameState.deck.findIndex((i) => i === influence),
        1
      )
    })
  })
  gameState.players = players
  gameState.turnPlayer = chance.pickone(gameState.players).name

  return gameState
}
