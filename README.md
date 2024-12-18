# cypress-cdp [![ci](https://github.com/bahmutov/cypress-cdp/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/bahmutov/cypress-cdp/actions/workflows/ci.yml) ![cypress version](https://img.shields.io/badge/cypress-13.17.0-brightgreen)

> A custom Cypress command to wrap the [Chrome remote debugger protocol](https://chromedevtools.github.io/devtools-protocol/) low level command

Read my blog posts that show this plugin in action:

- [Cypress automation](https://glebbahmutov.com/blog/cypress-automation/)
- [When Can The Test Click](https://glebbahmutov.com/blog/when-can-the-test-click/)
- [Solve The First Click](https://glebbahmutov.com/blog/solve-the-first-click/)
- [Rendered font](https://glebbahmutov.com/blog/rendered-font/)
- [Emulate Media In Cypress Tests](https://glebbahmutov.com/blog/cypress-emulate-media/)
- [Testing CSS Print Media Styles](https://glebbahmutov.com/blog/test-print-styles/)

🎓 Covered in my course [Cypress Plugins](https://cypress.tips/courses/cypress-plugins), [Cypress Network Testing Exercises](https://cypress.tips/courses/network-testing), and [TDD Calculator](https://cypress.tips/courses/tdd-calculator):
- [Lesson e5: Print page as PDF](https://cypress.tips/courses/tdd-calculator/lessons/e5)
- [Lesson c6: Exit fullscreen mode using cypress-cdp](https://cypress.tips/courses/cypress-plugins/lessons/c6)
- [Lesson c7: Set custom timezone and locale](https://cypress.tips/courses/cypress-plugins/lessons/c7)
- [Lesson c9: Disable network caching during the test](https://cypress.tips/courses/cypress-plugins/lessons/c9)
- [Bonus 99: Confirm the form works with CSS styles disabled](https://cypress.tips/courses/network-testing/lessons/bonus99)

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

## Examples

### Disable caching

Similar to clicking the checkbox "Disable cache" in the Network tab

```js
import 'cypress-cdp'
cy.CDP('Network.setCacheDisabled', {
  cacheDisabled: true,
})
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

## Type definitions

Defined in [src/index.d.ts](./src/index.d.ts) and copied from the original [PR 66237](https://github.com/DefinitelyTyped/DefinitelyTyped/pull/66237). If you want your project to "know" the `cy.CDP` command, include this dependency, for example:

```json
{
  "types": ["cypress", "cypress-cdp"]
}
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
