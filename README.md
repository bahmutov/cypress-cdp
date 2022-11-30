# cypress-cdp [![ci](https://github.com/bahmutov/cypress-cdp/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/bahmutov/cypress-cdp/actions/workflows/ci.yml) ![cypress version](https://img.shields.io/badge/cypress-9.7.0-brightgreen)

> A custom Cypress command to wrap the [Chrome remote debugger protocol](https://chromedevtools.github.io/devtools-protocol/) low level command

Read the blog posts:

- [Cypress automation](https://glebbahmutov.com/blog/cypress-automation/)
- [When Can The Test Click](https://glebbahmutov.com/blog/when-can-the-test-click/)
- [Solve The First Click](https://glebbahmutov.com/blog/solve-the-first-click/)
- [Rendered font](https://glebbahmutov.com/blog/rendered-font/)

🎓 Covered in my course [Cypress Plugins](https://cypress.tips/courses/cypress-plugins)

## Install

Add this plugin as your dev dependency

```
# install using NPM
$ npm i -D cypress-cdp
# or install using Yarn
$ yarn add -D cypress-cdp
```

Then import this plugin in your spec or support file

```js
// https://github.com/bahmutov/cypress-cdp
import 'cypress-cdp'
```

## API

### CDP

#### CDP example 1

```js
const selector = 'button#one'
cy.CDP('Runtime.evaluate', {
  expression: 'frames[0].document.querySelector("' + selector + '")',
}).should((v) => {
  expect(v.result).to.have.property('objectId')
})
```

**Tip:** be careful with selectors, you probably will need to escape them. For example, this library uses this escape

```js
const escapedSelector = JSON.stringify(selector)
cy.CDP('Runtime.evaluate', {
  expression: 'frames[0].document.querySelector(' + escapedSelector + ')',
})
```

### hasEventListeners

#### hasEventListeners example

```js
// any event listeners are attached
cy.hasEventListeners('button#one')
// "click" event listeners are attached
cy.hasEventListeners('button#one', { type: 'click' })
```

### getCDPNodeId

Returns the internal element's Node Id that can be used to query the run-time properties, for example the rendered font.

```js
cy.getCDPNodeId('body').then((nodeId) => {
  cy.CDP('CSS.getPlatformFontsForNode', {
    nodeId,
  })
})
```

## Small print

Author: Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt; &copy; 2022

- [@bahmutov](https://twitter.com/bahmutov)
- [glebbahmutov.com](https://glebbahmutov.com)
- [blog](https://glebbahmutov.com/blog)
- [videos](https://www.youtube.com/glebbahmutov)
- [presentations](https://slides.com/bahmutov)
- [cypress.tips](https://cypress.tips)
- [Cypress Tips & Tricks Newsletter](https://cypresstips.substack.com/)
- [my Cypress courses](https://cypress.tips/courses)

License: MIT - do anything with the code, but don't blame me if it does not work.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/bahmutov/cypress-cdp/issues) on Github

## MIT License

Copyright (c) 2022 Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt;

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
