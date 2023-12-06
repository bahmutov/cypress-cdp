const { defineConfig } = require('cypress')

module.exports = defineConfig({
  fixturesFolder: false,
  viewportWidth: 400,
  viewportHeight: 200,
  e2e: {
    setupNodeEvents(on, config) {},
    supportFile: false,
  },
})
