import { Actions, Influences, Responses } from '../../../shared/types/game'
import { getGameState } from '../helpers/gameState'

describe('Games', () => {
  it('should play game using all actions', () => {
    const harper = 'Harper'
    const david = 'David'

    const gameState = getGameState({
      players: [
        {
          name: harper,
          influences: [Influences.Duke, Influences.Captain],
          deadInfluences: [],
          ai: false,
          coins: 2,
          color: '#00cc00',
          id: harper
        },
        {
          name: david,
          influences: [Influences.Ambassador, Influences.Contessa],
          deadInfluences: [],
          ai: false,
          coins: 2,
          color: '#33aaff',
          id: david
        }
      ]
    })

    cy.task('setGameState', {
      state: {
        ...gameState,
        isStarted: true,
        turnPlayer: david,
        eventLogs: []
      }
    })

    const gameUrl = `/game?roomId=${encodeURIComponent(gameState.roomId)}`

    cy.loadPlayer(gameUrl, david)
    cy.contains('button', Actions.Tax).click()

    cy.loadPlayer(gameUrl, harper)
    cy.contains('button', Responses.Pass).click()
    cy.contains('button', Actions.Steal).click()
    cy.contains('button', david).click()

    cy.loadPlayer(gameUrl, david)
    cy.contains('button', Responses.Pass).click()
    cy.contains('button', Actions.Income).click()

    cy.loadPlayer(gameUrl, harper)
    cy.contains('button', Actions.ForeignAid).click()

    cy.loadPlayer(gameUrl, david)
    cy.contains('button', Responses.Block).click()
    cy.contains('button', Influences.Duke).click()

    cy.loadPlayer(gameUrl, harper)
    cy.contains('button', Responses.Challenge).click()

    cy.loadPlayer(gameUrl, david)
    cy.contains('button', Influences.Contessa).click()
    cy.contains('button', Actions.Assassinate).click()
    cy.contains('button', harper).click()

    cy.loadPlayer(gameUrl, harper)
    cy.contains('button', Responses.Pass).click()
    cy.contains('button', Influences.Duke).click()
    cy.contains('button', Actions.Income).click()

    cy.loadPlayer(gameUrl, david)
    cy.contains('button', Actions.Exchange).click()

    cy.loadPlayer(gameUrl, harper)
    cy.contains('button', Responses.Pass).click()

    cy.loadPlayer(gameUrl, david)
    cy.get('input[type="checkbox"]').eq(1).click()

    cy.loadPlayer(gameUrl, harper)
    cy.contains('button', Actions.Coup).click()
    cy.contains('button', david).click()

    cy.contains(`${harper} Wins!`)

    cy.contains('David is trying to collect Tax')
    cy.contains('David collected Tax')
    cy.contains('Harper is trying to Steal from David')
    cy.contains('Harper Stole from David')
    cy.contains('David collected Income')
    cy.contains('Harper is trying to collect Foreign Aid')
    cy.contains('David is trying to block Harper as Duke')
    cy.contains('Harper is challenging David')
    cy.contains('Harper successfully challenged David')
    cy.contains('David failed to block Harper')
    cy.contains('David lost their Contessa')
    cy.contains('Harper collected Foreign Aid')
    cy.contains('David is trying to Assassinate Harper')
    cy.contains('David Assassinated Harper')
    cy.contains('Harper lost their Duke')
    cy.contains('Harper collected Income')
    cy.contains('David is trying to Exchange influences')
    cy.contains('David Exchanged influences')
    cy.contains('Harper Couped David')
    cy.contains(/David lost their .+/)
    cy.contains('David is out!')
  })
})
