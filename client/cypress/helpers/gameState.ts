import Chance from 'chance'
import { GameState, Influences, Player } from '../../../shared/types/game'
import { shuffle } from '../../../server/src/utilities/array'

const chance = new Chance()

export const getGameState = ({ players }: { players: Player[] }) => {
  const gameState: GameState = {
    deck: shuffle(Object.values(Influences)
      .flatMap((influence) => Array.from({ length: 3 }, () => influence))),
    eventLogs: chance.n(chance.string, chance.natural({ min: 2, max: 10 })),
    isStarted: chance.bool(),
    availablePlayerColors: chance.n(chance.color, 6),
    players: [],
    pendingInfluenceLoss: {},
    lastEventTimestamp: chance.date(),
    roomId: chance.string(),
    settings: { eventLogRetentionTurns: 100 },
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
