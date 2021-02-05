'use strict'
const process = require('process')

const epsagon = require('epsagon')

epsagon.init({
  token: process.env.EPSAGON_TOKEN || '',
  appName: process.env.SITE_NAME,
  metadataOnly: false,
  labels: [
    ['branch', process.env.HEAD],
    ['build-id', process.env.BUILD_ID],
    ['context', process.env.CONTEXT],
    ['commit', process.env.COMMIT_REF],
  ],
})

// eslint-disable-next-line node/no-missing-require
const handler = epsagon.lambdaWrapper(require('./REQUIRE_PLACEHOLDER').handler)

module.exports = {
  handler,
}
