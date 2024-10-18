import { Actions, Influences, Responses } from '../../../shared/types/game'
import { getGameState } from '../helpers/gameState'

describe('Games', () => {
  it('should play game using all actions', () => {
    const david = 'David'
    const harper = 'Harper'

    const gameState = getGameState({
      players: [
        {
          name: david,
          influences: [Influences.Duke, Influences.Captain],
          deadInfluences: [],
          ai: false,
          coins: 2,
          color: '#00cc00',
          id: david
        },
        {
          name: harper,
          influences: [Influences.Ambassador, Influences.Contessa],
          deadInfluences: [],
          ai: false,
          coins: 2,
          color: '#33aaff',
          id: harper
        }
      ]
    })

    cy.task('setGameState', {
      state: {
        ...gameState,
        isStarted: true,
        turnPlayer: harper,
        eventLogs: []
      }
    })

    const gameUrl = `/game?roomId=${encodeURIComponent(gameState.roomId)}`

    cy.loadPlayer(gameUrl, harper)
    cy.contains('button', Actions.Tax).click()

    cy.loadPlayer(gameUrl, david)
    cy.contains('button', Responses.Pass).click()
    cy.contains('button', Actions.Steal).click()
    cy.contains('button', harper).click()

    cy.loadPlayer(gameUrl, harper)
    cy.contains('button', Responses.Pass).click()
    cy.contains('button', Actions.Income).click()

    cy.loadPlayer(gameUrl, david)
    cy.contains('button', Actions.ForeignAid).click()

    cy.loadPlayer(gameUrl, harper)
    cy.contains('button', Responses.Block).click()
    cy.contains('button', Influences.Duke).click()

    cy.loadPlayer(gameUrl, david)
    cy.contains('button', Responses.Challenge).click()

    cy.loadPlayer(gameUrl, harper)
    cy.contains('button', Influences.Contessa).click()
    cy.contains('button', Actions.Assassinate).click()
    cy.contains('button', david).click()

    cy.loadPlayer(gameUrl, david)
    cy.contains('button', Responses.Pass).click()
    cy.contains('button', Influences.Duke).click()
    cy.contains('button', Actions.Income).click()

    cy.loadPlayer(gameUrl, harper)
    cy.contains('button', Actions.Exchange).click()

    cy.loadPlayer(gameUrl, david)
    cy.contains('button', Responses.Pass).click()

    cy.loadPlayer(gameUrl, harper)
    cy.get('input[type="checkbox"]').eq(1).click()

    cy.loadPlayer(gameUrl, david)
    cy.contains('button', Actions.Coup).click()
    cy.contains('button', harper).click()

    cy.contains(`${david} Wins!`)
  })
})
