/// <reference types="cypress" />
// @ts-check

import '../../src'

it('has the CDP command', () => {
  expect(cy.CDP, 'CDP method').to.be.a('function')
})
