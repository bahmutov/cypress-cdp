/// <reference types="cypress" />

Cypress.Commands.add('CDP', (rdpCommand, params, options = {}) => {
  const logOptions = {
    name: 'CDP',
    message: rdpCommand,
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
