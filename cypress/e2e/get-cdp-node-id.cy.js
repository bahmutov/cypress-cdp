/// <reference types="cypress" />
// @ts-check

import '../../src'

/**
 * @template T
 * @param {() => Cypress.Chainable<T>} runCommand
 */
const collectCdpMessages = (runCommand) => {
  /** @type {string[]} */
  const messages = []

  /**
   * @param {{ name?: string, message?: string }} attrs
   */
  const onLogAdded = (attrs) => {
    if (attrs.name === 'CDP' && typeof attrs.message === 'string') {
      messages.push(attrs.message)
    }
  }

  Cypress.on('log:added', onLogAdded)

  const stopCollecting = () => {
    Cypress.off('log:added', onLogAdded)
  }

  /** @param {Error} error */
  const onFail = (error) => {
    Cypress.off('fail', onFail)
    stopCollecting()

    throw error
  }

  Cypress.on('fail', onFail)

  return cy.then(runCommand).then(() => {
    Cypress.off('fail', onFail)
    stopCollecting()

    return messages
  })
}

/** @param {string} message */
const normalizeCdpMessage = (message) =>
  message
    .replace(/"nodeId":\d+/g, '"nodeId":<nodeId>')
    .replace(/"backendNodeId":\d+/g, '"backendNodeId":<backendNodeId>')
    .replace(/"objectId":"[^"]+"/g, '"objectId":"<objectId>"')

it('should log internal CDP commands for getCDPNodeId by default', () => {
  cy.visit('/public/index.html')

  collectCdpMessages(() =>
    cy.getCDPNodeId('body').should('be.a', 'number'),
  ).then((messages) => {
    cy.wrap(messages.map(normalizeCdpMessage)).should('deep.equal', [
      'DOM.enable ',
      'CSS.enable ',
      'DOM.getDocument {"depth":50,"pierce":true}',
      'DOM.querySelector iframe.aut-iframe',
      'DOM.describeNode {"nodeId":<nodeId>}',
      'DOM.resolveNode {"backendNodeId":<backendNodeId>}',
      'DOM.requestNode {"objectId":"<objectId>"}',
      'DOM.querySelector body',
    ])
  })
})

it('should suppress internal CDP logs for getCDPNodeId', () => {
  cy.visit('/public/index.html')

  collectCdpMessages(() =>
    cy.getCDPNodeId('body', { log: false }).should('be.a', 'number'),
  ).then((messages) => {
    cy.wrap(messages).should('deep.equal', [])
  })
})
