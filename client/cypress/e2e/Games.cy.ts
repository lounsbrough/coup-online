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
          claimedInfluences: [],
          unclaimedInfluences: [],
          deadInfluences: [],
          ai: false,
          grudges: {},
          coins: 1,
          color: '#00cc00',
          id: harper
        },
        {
          name: david,
          influences: [Influences.Ambassador, Influences.Contessa],
          claimedInfluences: [],
          unclaimedInfluences: [],
          deadInfluences: [],
          ai: false,
          grudges: {},
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
        eventLogs: [],
        settings: { eventLogRetentionTurns: 100, allowRevive: true },
      }
    })

    const gameUrl = `/game?roomId=${encodeURIComponent(gameState.roomId)}`

    cy.loadPlayer(gameUrl, david)
    cy.clickGameBoardButton(Actions.Tax)

    cy.loadPlayer(gameUrl, harper)
    cy.clickGameBoardButton(Responses.Pass)
    cy.clickGameBoardButton(Actions.Steal)
    cy.clickGameBoardButton(david)

    cy.loadPlayer(gameUrl, david)
    cy.clickGameBoardButton(Responses.Pass)
    cy.clickGameBoardButton(Actions.Income)

    cy.loadPlayer(gameUrl, harper)
    cy.clickGameBoardButton(Actions.ForeignAid)

    cy.loadPlayer(gameUrl, david)
    cy.clickGameBoardButton(Responses.Block)
    cy.clickGameBoardButton(Influences.Duke)

    cy.loadPlayer(gameUrl, harper)
    cy.clickGameBoardButton(Responses.Challenge)

    cy.loadPlayer(gameUrl, david)
    cy.clickGameBoardButton(Influences.Contessa)
    cy.clickGameBoardButton(Actions.Assassinate)
    cy.clickGameBoardButton(harper)

    cy.loadPlayer(gameUrl, harper)
    cy.clickGameBoardButton(Responses.Pass)
    cy.clickGameBoardButton(Influences.Duke)
    cy.clickGameBoardButton(Actions.ForeignAid)

    cy.loadPlayer(gameUrl, david)
    cy.clickGameBoardButton(Responses.Pass)
    cy.clickGameBoardButton(Actions.Exchange)

    cy.loadPlayer(gameUrl, harper)
    cy.clickGameBoardButton(Responses.Pass)

    cy.loadPlayer(gameUrl, david)
    cy.get('input[type="checkbox"]').eq(1).click()

    cy.loadPlayer(gameUrl, harper)
    cy.clickGameBoardButton(Actions.Coup)
    cy.clickGameBoardButton(david)

    cy.contains(`${harper} Wins!`)

    cy.contains('David is trying to collect Tax')
    cy.contains('David collected Tax')
    cy.contains('Harper is trying to Steal from David')
    cy.contains('Harper Stole from David')
    cy.contains('David collected Income')
    cy.contains('Harper is trying to receive Foreign Aid')
    cy.contains('David is trying to block Harper as Duke')
    cy.contains('Harper is challenging David')
    cy.contains('Harper successfully challenged David')
    cy.contains('David failed to block Harper')
    cy.contains('David lost their Contessa')
    cy.contains('Harper received Foreign Aid')
    cy.contains('David is trying to Assassinate Harper')
    cy.contains('David Assassinated Harper')
    cy.contains('Harper lost their Duke')
    cy.contains('Harper received Foreign Aid')
    cy.contains('David is trying to Exchange influences')
    cy.contains('David Exchanged influences')
    cy.contains('Harper Couped David')
    cy.contains(/David lost their .+/)
    cy.contains('David is out!')
  })
})
