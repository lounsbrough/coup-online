import { Influences } from '../../../shared/types/game'
import { getGameState } from '../helpers/gameState'

describe('Games', () => {
  it('should tax -> pass', () => {
    const gameState = getGameState({
      players: [
        {
          name: 'Harper',
          influences: [Influences.Ambassador, Influences.Contessa],
          deadInfluences: [],
          ai: false,
          coins: 2,
          color: '#0000ff',
          id: 'harper'
        },
        {
          name: 'David',
          influences: [Influences.Duke, Influences.Captain],
          deadInfluences: [],
          ai: false,
          coins: 2,
          color: '#00ff00',
          id: 'david'
        }
      ]
    })

    cy.task('setGameState', {
      state: {
        ...gameState,
        isStarted: true,
        turnPlayer: 'Harper',
        eventLogs: []
      }
    })

    cy.loadPlayer(gameState.roomId, 'harper')

    cy.contains('Tax').click()

    cy.loadPlayer(gameState.roomId, 'david')

    cy.contains('Pass').click()
  })
})
