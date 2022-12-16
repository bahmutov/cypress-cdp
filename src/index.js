/// <reference types="cypress" />

Cypress.Commands.add('CDP', (rdpCommand, params, options = {}) => {
  const logOptions = {
    name: 'CDP',
    message: rdpCommand,
  }

  if (rdpCommand === 'DOM.querySelector') {
    logOptions.message += ' ' + params.selector
  } else {
    const limitN = 60
    const paramsStringified = params ? JSON.stringify(params) : ''
    logOptions.message +=
      paramsStringified.length > limitN
        ? ' ' + paramsStringified.slice(0, limitN) + '...'
        : ' ' + paramsStringified
  }

  let log
  if (options.log !== false) {
    log = Cypress.log(logOptions)
  }

  const getValue = () => {
    return Cypress.automation('remote:debugger:protocol', {
      command: rdpCommand,
      params,
    })
  }

  const resolveValue = () => {
    return Cypress.Promise.try(getValue).then((value) => {
      return cy.verifyUpcomingAssertions(value, options, {
        onRetry: resolveValue,
      })
    })
  }

  return resolveValue().then((value) => {
    if (options.log !== false) {
      logOptions.consoleProps = () => {
        return {
          result: value,
        }
      }
      log.snapshot().end()
    }

    return value
  })
})

Cypress.Commands.add('hasEventListeners', (selector, options = {}) => {
  const logOptions = {
    name: 'hasEventListeners',
    message: `checking element "${selector}"`,
  }
  let log
  if (options.log !== false) {
    log = Cypress.log(logOptions)
  }

  cy.get(selector, { log: false }).should(($el) => {
    if ($el.length !== 1) {
      throw new Error(`Need a single element with selector "${selector}`)
    }
  })

  const escapedSelector = JSON.stringify(selector)
  cy.CDP(
    'Runtime.evaluate',
    {
      expression: 'Cypress.$(' + escapedSelector + ')[0]',
    },
    { log: false },
  )
    .should((v) => {
      if (!v || !v.result || !v.result.objectId) {
        throw new Error(`Cannot find element "${selector}"`)
      }
    })
    .then((v) => {
      const objectId = v.result.objectId
      cy.CDP(
        'DOMDebugger.getEventListeners',
        {
          objectId,
          depth: -1,
          pierce: true,
        },
        { log: false },
      )
        .should((v) => {
          if (!v.listeners) {
            throw new Error('No listeners')
          }
          if (!v.listeners.length) {
            throw new Error('Zero listeners')
          }
          if (options.type) {
            const filtered = v.listeners.filter((l) => l.type === options.type)
            if (!filtered.length) {
              throw new Error(`Zero listeners of type "${options.type}"`)
            }
          }
        })
        .then(({ listeners }) => {
          if (options.log !== false) {
            logOptions.consoleProps = () => {
              return {
                result: listeners,
              }
            }
          }
        })
    })
})

Cypress.Commands.add('getCDPNodeId', (selector) => {
  cy.CDP('DOM.enable')
  cy.CDP('CSS.enable')
  cy.CDP('DOM.getDocument', {
    depth: 50,
    pierce: true,
  }).then((doc) => {
    // let's get the application iframe
    cy.CDP('DOM.querySelector', {
      nodeId: doc.root.nodeId,
      selector: 'iframe.aut-iframe',
    }).then((iframeQueryResult) => {
      cy.CDP('DOM.describeNode', {
        nodeId: iframeQueryResult.nodeId,
      }).then((iframeDescription) => {
        cy.CDP('DOM.resolveNode', {
          backendNodeId: iframeDescription.node.contentDocument.backendNodeId,
        }).then((contentDocRemoteObject) => {
          cy.CDP('DOM.requestNode', {
            objectId: contentDocRemoteObject.object.objectId,
          }).then((contentDocNode) => {
            cy.CDP('DOM.querySelector', {
              nodeId: contentDocNode.nodeId,
              selector,
            }).its('nodeId')
          })
        })
      })
    })
  })
})
