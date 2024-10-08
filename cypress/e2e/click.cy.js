/// <reference types="cypress" />
// @ts-check

import '../../src'

it('clicks on the button too soon', () => {
  cy.visit('public/index.html')
  cy.get('button#one').click()
  // we clicked too soon - the button has no event handler yet
  cy.get('#output').should('have.text', '').and('not.be.visible')
})

it('clicks on the button after a delay', () => {
  cy.visit('public/index.html')
  cy.wait(1000)
  cy.get('button#one').click()
  cy.contains('#output', 'clicked')
})

it('clicks on the button when there is an event handler', () => {
  cy.visit('public/index.html')

  const selector = 'button#one'
  cy.CDP('Runtime.evaluate', {
    expression: 'frames[0].document.querySelector("' + selector + '")',
  })
    .should((v) => {
      expect(v.result).to.have.property('objectId')
    })
    .its('result.objectId')
    .should('be.a', 'string')
    .then((objectId) => {
      cy.CDP('DOMDebugger.getEventListeners', {
        objectId,
        depth: -1,
        pierce: true,
      }).should((v) => {
        expect(v.listeners).to.have.length.greaterThan(0)
      })
    })
  // now we can click that button
  cy.get(selector).click()
})

it('uses hasEventListeners command', () => {
  cy.visit('public/index.html')
  cy.hasEventListeners('button#one')
  // now we can click that button
  cy.get('button#one').click()
})

it('uses hasEventListeners command with timeout option', () => {
  cy.visit('public/index.html')
  cy.hasEventListeners('button#two', { timeout: 10000 })
  // now we can click that button
  cy.get('button#two').click()
  cy.get('output#output-two').should('contain.text', 'clicked')
})

it('hasEventListeners command handles re-renders', () => {
  cy.visit('public/index.html')
  cy.hasEventListeners('button#three')
  // now we can click that button
  cy.get('button#three').click()
  cy.get('output#output-three').should('contain.text', 'clicked')
})

it('handles selectors with quotes', () => {
  cy.visit('public/index.html')
  const selector = '[aria-label="Click this button"]'
  cy.hasEventListeners(selector)
  // now we can click that button
  cy.get(selector).click()
})

it('handles jQuery selectors', () => {
  cy.visit('public/index.html')
  const selector = 'button:contains("Click me!")'
  cy.hasEventListeners(selector)
  // now we can click that button
  cy.get(selector).click()
})
