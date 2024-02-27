/// <reference types="cypress" />
// @ts-check

it('clicks on the button', () => {
  cy.visit('public/index.html')
  // let the application fully load
  cy.wait(5000)
  cy.get('button#one').click()
  cy.contains('#output', 'clicked')
})
