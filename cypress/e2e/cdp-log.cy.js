/// <reference types="cypress" />
// @ts-check

import '../../src'

/** @type {Array<(attributes: {name?: string}) => void>} */
const logAddedHandlers = []

/** @param {(attributes: {name?: string}) => void} handler */
const addLogAddedHandler = (handler) => {
  logAddedHandlers.push(handler)
  Cypress.on('log:added', handler)
}

afterEach(() => {
  for (const handler of logAddedHandlers.splice(0)) {
    Cypress.off('log:added', handler)
  }
})

it('should not create a Cypress log entry when logging is disabled', () => {
  let cdpLogCount = 0
  /** @param {{ name?: string }} attributes */
  const onLogAdded = (attributes) => {
    if (attributes.name === 'CDP') {
      cdpLogCount += 1
    }
  }

  addLogAddedHandler(onLogAdded)

  cy.CDP(
    'Runtime.evaluate',
    { expression: 'document.readyState' },
    { log: false },
  )

  cy.then(() => {
    cy.wrap(cdpLogCount).should('eq', 0)
  })
})

it('should create a Cypress log entry when logging is enabled', () => {
  let cdpLogCount = 0
  /** @param {{ name?: string }} attributes */
  const onLogAdded = (attributes) => {
    if (attributes.name === 'CDP') {
      cdpLogCount += 1
    }
  }

  addLogAddedHandler(onLogAdded)

  cy.CDP('Runtime.evaluate', { expression: 'document.readyState' })

  cy.then(() => {
    cy.wrap(cdpLogCount).should('eq', 1)
  })
})

it('should merge custom Cypress log options into the CDP log entry', () => {
  /** @type {{ displayName?: string } | undefined} */
  let cdpLogAttributes
  /** @param {{ name?: string, displayName?: string }} attributes */
  const onLogAdded = (attributes) => {
    if (attributes.name === 'CDP') {
      cdpLogAttributes = attributes
    }
  }

  addLogAddedHandler(onLogAdded)

  cy.CDP(
    'Runtime.evaluate',
    { expression: 'document.readyState' },
    { log: { displayName: 'Custom CDP' } },
  )

  cy.then(() => {
    cy.wrap(cdpLogAttributes?.displayName).should('eq', 'Custom CDP')
  })
})
