/// <reference types="cypress" />

import '../../src'

// not working yet, the command log screenshot has some weird scaling
describe.skip(
  'screenshots',
  { viewportWidth: 1000, viewportHeight: 1000 },
  () => {
    it('takes the test runner screenshot', () => {
      cy.visit('public/loading/index.html')
      cy.contains('First section').should('be.visible')
      cy.CDP('Page.captureScreenshot', { format: 'png' }).then(({ data }) => {
        cy.writeFile('cypress/screenshots/test-runner.png', data, 'base64')
      })
    })

    it.only('takes the command log screenshot', () => {
      // insert more dummy commands to make the Command Log overflow
      Cypress._.times(60, cy.log)
      cy.visit('public/loading/index.html')
      cy.contains('First section')
        .should('be.visible')
        .then(() => {
          const reporter = Cypress.$(window.top.document).find(
            '.reporter .container',
          )
          console.log(reporter)
          reporter.css('overflow-y', 'visible')
        })

      // CDP commands
      // https://github.com/puppeteer/puppeteer/pull/452/files
      cy.CDP('Runtime.evaluate', {
        expression: `document.querySelector('.reporter .container').getBoundingClientRect().x`,
      })
        .its('result.value')
        .then((x) => {
          cy.CDP('Runtime.evaluate', {
            expression: `document.querySelector('.reporter .container').getBoundingClientRect().y`,
          })
            .its('result.value')
            .then((y) => {
              cy.CDP('Runtime.evaluate', {
                expression: `document.querySelector('.reporter .container').getBoundingClientRect().width`,
              })
                .its('result.value')
                .then((width) => {
                  cy.CDP('Runtime.evaluate', {
                    expression: `document.querySelector('.reporter .container').getBoundingClientRect().height`,
                  })
                    .its('result.value')
                    .then((height) => {
                      console.log({ x, y, width, height })

                      // cy.CDP('Emulation.setDeviceMetricsOverride', {
                      //   width: Math.round(width),
                      //   height: Math.round(height),
                      //   deviceScaleFactor: 1,
                      //   mobile: false,
                      //   fitWindow: false,
                      // })

                      cy.CDP('Page.captureScreenshot', {
                        format: 'png',
                        captureBeyondViewport: true,
                        clip: {
                          x: Math.round(x),
                          y: Math.round(y),
                          width: Math.round(width),
                          height: Math.round(height),
                          scale: 1,
                        },
                      }).then(({ data }) => {
                        cy.writeFile(
                          'cypress/screenshots/x.png',
                          data,
                          'base64',
                        )
                      })
                    })
                })
            })
        })

      // cy.wait(1000)
      // cy.CDP('DOM.enable')
      // cy.CDP('CSS.enable')
      // cy.CDP('DOM.getDocument', {
      //   depth: 10,
      //   pierce: false,
      // })
      //   .then((doc) => {
      //     cy.CDP('DOM.querySelector', {
      //       nodeId: doc.root.nodeId,
      //       selector: '.reporter',
      //     }).its('nodeId')
      //   })
      //   .then((nodeId) => {
      //     // https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-captureScreenshot
      //     cy.CDP('Page.captureScreenshot', {
      //       format: 'png',
      //       captureBeyondViewport: true,
      //     }).then(({ data }) => {
      //       cy.writeFile('cypress/screenshots/x.png', data, 'base64')
      //     })
      //   })
    })
  },
)
