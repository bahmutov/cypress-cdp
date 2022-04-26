/// <reference types="cypress" />

import '../../src'

it('gets the declared font', () => {
  cy.visit('/public/index.html')
  cy.get('body').then(($body) => {
    cy.window()
      .invoke('getComputedStyle', $body[0])
      .its('fontFamily')
      .should('include', 'Satisfy')
  })
})

it('gets the rendered font', () => {
  cy.visit('/public/index.html')
  cy.getCDPNodeId('body').then((nodeId) => {
    console.log(nodeId)
    cy.CDP('CSS.getPlatformFontsForNode', {
      nodeId,
    })
      .its('fonts')
      .should('have.length.greaterThan', 0)
      .its('0.familyName')
      .then(cy.log)
  })
})

it.skip('gets the rendered font (internal)', () => {
  cy.visit('/public/index.html')
  cy.get('body').then(($body) => {
    cy.window()
      .invoke('getComputedStyle', $body[0])
      .its('fontFamily')
      .should('include', 'Satisfy')
  })

  cy.wait(1000)
  cy.CDP(
    'Runtime.evaluate',
    {
      expression: 'frames[0].document.querySelector("body p")',
    },
    { log: false },
  )
    .should((v) => {
      if (!v || !v.result || !v.result.objectId) {
        throw new Error(`Cannot find element "body"`)
      }
    })
    .then((v) => {
      console.log(v)
      // iframe inspection w/o getFlattenedDocument()
      // https://gist.github.com/imaman/cd7c943e0831a447b1d2b073ede347e2
      const nodeId = v.result.objectId

      // https://stackoverflow.com/questions/47911613/fetch-rendered-font-using-chrome-headless-browser
      // cy.CDP('Page.getFrameTree')
      //   .then(console.log)
      //   .its('frameTree.childFrames.0')
      //   .then(console.log)
      // cy.CDP('DOM.enable')
      cy.CDP('CSS.enable')
      cy.CDP('DOM.getDocument', {
        depth: 50,
        pierce: true,
      }).then(
        // .then(
        //   console.log,
        // )
        (doc) => {
          console.log('doc', doc)
          // const appDoc = doc.root.children[0].nodeId
          // let's get the application iframe
          cy.CDP('DOM.querySelector', {
            nodeId: doc.root.nodeId,
            selector: 'iframe.aut-iframe',
          }).then((iframeQueryResult) => {
            console.log('iframeQueryResult', iframeQueryResult)

            cy.CDP('DOM.describeNode', {
              nodeId: iframeQueryResult.nodeId,
            }).then((iframeDescription) => {
              console.log('iframeDescription', iframeDescription)

              cy.CDP('DOM.resolveNode', {
                backendNodeId:
                  iframeDescription.node.contentDocument.backendNodeId,
              }).then((contentDocRemoteObject) => {
                console.log('contentDocRemoteObject', contentDocRemoteObject)

                cy.CDP('DOM.requestNode', {
                  objectId: contentDocRemoteObject.object.objectId,
                }).then((contentDocNode) => {
                  console.log('contentDocNode', contentDocNode)

                  cy.CDP('DOM.querySelector', {
                    nodeId: contentDocNode.nodeId,
                    selector: 'body',
                  }).then((body) => {
                    console.log('app body', body)
                    cy.CDP('CSS.getPlatformFontsForNode', {
                      nodeId: body.nodeId,
                    })
                      .then(console.log)
                      .its('fonts')
                      .should('have.length.gt', 0)
                      .then((fonts) =>
                        Cypress._.find(fonts, { familyName: 'Satisfy' }),
                      )
                      .should('exist')
                  })
                })
              })
            })
          })
        },
      )

      // https://chromedevtools.github.io/devtools-protocol/tot/CSS/
      // https://chromiumcodereview.appspot.com/22923010/patch/47001/48013
      // debugger
      // cy.CDP('CSS.getPlatformFontsForNode', {
      //   name: 'nodeId',
      //   $ref: nodeId,
      // }).then(cy.log)
    })
})
