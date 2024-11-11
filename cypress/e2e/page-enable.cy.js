/// <reference types="cypress" />
// @ts-check

import '../../src'

it('enables the Page domain', () => {
  cy.CDP('Page.enable')
})
