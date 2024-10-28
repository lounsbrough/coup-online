describe('Waiting Room', () => {
  it('should allow players to create, join, leave, and start games', () => {
    cy.loadPlayer('/', 'player1')
    cy.contains('button', 'Create New Game').click()
    cy.get('input').should('not.be.disabled').type('Player 1')
    cy.contains('button', 'Create Game').click()

    cy.contains(/Room: .+/).then((el) => {
      cy.setCookie('cypressRoomId', el.text().replace('Room: ', ''))
    })

    cy.loadPlayer('/', 'player2')
    cy.contains('button', 'Join Existing Game').click()

    cy.getCookie('cypressRoomId').then((cookie) => {
      cy.get('input').eq(0).should('not.be.disabled').type(cookie!.value)
      cy.get('input').eq(1).should('not.be.disabled').type('Player 2')
    })

    cy.contains('button', 'Join Game').click()

    cy.get('*[data-testid="CloseIcon"').eq(0).click()

    cy.contains('Add at least one more player to start game')

    cy.loadPlayer('/', 'player1')
    cy.contains('button', 'Join Existing Game').click()

    cy.getCookie('cypressRoomId').then((cookie) => {
      cy.get('input').eq(0).should('not.be.disabled').type(cookie!.value)
      cy.get('input').eq(1).should('not.be.disabled').type('Player One')
    })

    cy.contains('button', 'Join Game').click()
    cy.contains('button', 'Start Game').click()
    cy.contains('button', 'Reset Game').click()

    cy.loadPlayer('/', 'player2')
    cy.contains('button', 'Join Existing Game').click()

    cy.getCookie('cypressRoomId').then((cookie) => {
      cy.get('input').eq(0).should('not.be.disabled').type(cookie!.value)
      cy.get('input').eq(1).should('not.be.disabled').type('Player 2')
    })

    cy.contains('button', 'Join Game').click()
    cy.contains('button', 'Reset').click()
    cy.contains('button', 'Start Game').click()
  })
})
