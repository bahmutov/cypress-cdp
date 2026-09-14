/// <reference types="cypress" />

const formatMessage = (rdpCommand, params) => {
  if (rdpCommand === 'DOM.querySelector') {
    return `${rdpCommand} ${params?.selector ?? ''}`
  }

  const limit = 60
  const paramsStringified = params ? JSON.stringify(params) : ''

  return paramsStringified.length > limit
    ? `${rdpCommand} ${paramsStringified.slice(0, limit)}...`
    : `${rdpCommand} ${paramsStringified}`
}

Cypress.Commands.add('CDP', (rdpCommand, params, options = {}) => {
  const shouldLog = options.log !== false
  const customLogOptions = typeof options.log === 'object' ? options.log : {}
  const log = shouldLog
    ? Cypress.log({
        name: 'CDP',
        message: formatMessage(rdpCommand, params),
        ...customLogOptions,
      })
    : undefined

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
    if (log) {
      log.set({
        consoleProps: () => ({
          result: value,
        }),
      })

      log.snapshot().end()
    }

    return value
  })
})

let eventListenerStatus // track most recent failure mode
let eventListenerRun
let maxTimeout
Cypress.Commands.add('hasEventListeners', (selector, options = {}) => {
  let retryOpts
  if (options.timeout === 0) {
    // is a retry
    retryOpts = options
  } else {
    // set up the timer
    eventListenerStatus = ''
    let runId = Date.now()
    eventListenerRun = runId // prevent failing the next test
    maxTimeout = options.timeout ?? Cypress.config().defaultCommandTimeout
    retryOpts = { ...options, timeout: 0, log: false }
    setTimeout(() => {
      if (eventListenerRun === runId && eventListenerStatus !== 'Passed') {
        throw new Error(eventListenerStatus)
      }
    }, maxTimeout)
  }

  const shouldLog = options.log !== false
  const log = shouldLog
    ? Cypress.log({
        name: 'hasEventListeners',
        message: `checking element "${selector}"`,
      })
    : undefined

  cy.get(selector, { log: false, timeout: maxTimeout }).should(($el) => {
    if ($el.length !== 1) {
      throw new Error(`Need a single element with selector "${selector}"`)
    }
  })

  const escapedSelector = JSON.stringify(selector)
  cy.CDP(
    'Runtime.evaluate',
    {
      expression: 'Cypress.$(' + escapedSelector + ')[0]',
    },
    { log: false, timeout: maxTimeout },
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
        {
          log: false,
        },
      ).then((v) => {
        if (!v.listeners) {
          eventListenerStatus = 'No listeners'
          cy.hasEventListeners(selector, retryOpts)
          return
        }
        if (!v.listeners.length) {
          eventListenerStatus = 'Zero listeners'
          cy.hasEventListeners(selector, retryOpts)
          return
        }
        if (options.type) {
          const filtered = v.listeners.filter((l) => l.type === options.type)
          if (!filtered.length) {
            eventListenerStatus = `Zero listeners of type "${options.type}"`
            cy.hasEventListeners(selector, retryOpts)
            return
          }
        }
        eventListenerStatus = 'Passed'

        if (log) {
          log.set({
            consoleProps: () => ({
              result: v.listeners,
            }),
          })

          log.snapshot().end()
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
