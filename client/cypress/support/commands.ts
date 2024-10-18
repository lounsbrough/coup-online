/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />

import { confirmActionsStorageKey, playerIdStorageKey } from "../../src/helpers/localStorageKeys"

// ***********************************************
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      loadPlayer(roomId: string, playerId: string): Chainable<void>
    }
  }
}


Cypress.Commands.add('loadPlayer', (roomId: string, playerId: string) => {
  cy.visit(`/game?roomId=${encodeURIComponent(roomId)}`, {
    onBeforeLoad({ localStorage }) {
      localStorage.setItem(playerIdStorageKey, playerId)
      localStorage.setItem(confirmActionsStorageKey, JSON.stringify(false))
    }
  })
})
