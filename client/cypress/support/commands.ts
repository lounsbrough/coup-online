/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />

import { confirmActionsStorageKey, playerIdStorageKey } from "../../src/helpers/localStorageKeys"

// ***********************************************
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      clickGameBoardButton(buttonText: string): Chainable<void>
      loadPlayer(url: string, playerId: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('clickGameBoardButton', (buttonText: string) => {
  cy.get('.game-board').contains('button', buttonText).click()
})

Cypress.Commands.add('loadPlayer', (url: string, playerId: string) => {
  cy.visit(url, {
    onBeforeLoad({ localStorage }) {
      localStorage.setItem(playerIdStorageKey, playerId)
      localStorage.setItem(confirmActionsStorageKey, JSON.stringify(false))
    }
  })
})
