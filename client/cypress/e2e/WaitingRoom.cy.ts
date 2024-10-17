import { playerIdStorageKey } from '../../src/helpers/localStorageKeys'

describe('Waiting Room', () => {
  it('should allow players to create, join, leave, and start games', () => {
    cy.visit('/', {
      onBeforeLoad({ localStorage }) {
        localStorage.setItem(playerIdStorageKey, 'player1')
      }
    })
    cy.contains('button', 'Create New Game').click()
    cy.get('input').type('Player 1')
    cy.contains('button', 'Create Game').click()

    cy.contains(/Room: .+/).then((el) => {
      cy.setCookie('cypressRoomId', el.text().replace('Room: ', ''))
    })

    cy.visit('/', {
      onBeforeLoad({ localStorage }) {
        localStorage.setItem(playerIdStorageKey, 'player2')
      }
    })
    cy.contains('button', 'Join Existing Game').click()

    cy.getCookie('cypressRoomId').then(({ value }) => {
      cy.get('input').eq(0).type(value)
      cy.get('input').eq(1).type('Player 2')
    })

    cy.contains('button', 'Join Game').click()
  })
})
