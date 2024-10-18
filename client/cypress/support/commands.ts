/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />

import { confirmActionsStorageKey, playerIdStorageKey } from "../../src/helpers/localStorageKeys"

// ***********************************************
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      loadPlayer(url: string, playerId: string): Chainable<void>
    }
  }
}


Cypress.Commands.add('loadPlayer', (url: string, playerId: string) => {
  cy.visit(url, {
    onBeforeLoad({ localStorage }) {
      localStorage.setItem(playerIdStorageKey, playerId)
      localStorage.setItem(confirmActionsStorageKey, JSON.stringify(false))
    }
  })
})
