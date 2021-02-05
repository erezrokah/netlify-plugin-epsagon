const path = require('path')
const fs = require('fs')
const util = require('util')

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const rename = util.promisify(fs.rename)

const BUILD_ENVS = ['HEAD', 'BUILD_ID', 'CONTEXT', 'COMMIT_REF', 'SITE_NAME']

const generateTemplate = (content, newFunctionName) => {
  const template = content.replace('REQUIRE_PLACEHOLDER', `${newFunctionName}`)
  return BUILD_ENVS.reduce(
    (acc, env) =>
      acc.replace(`process.env.${env}`, `'${process.env[env] || env}'`),
    template,
  )
}

module.exports = {
  async onBuild({ utils: { build, status, functions } }) {
    if (!process.env.EPSAGON_TOKEN) {
      return build.failBuild(
        'Please configure EPSAGON_TOKEN as an environment variable',
      )
    }

    try {
      const functionsList = await functions.list({ runtime: 'js' })
      const template = await readFile(`${__dirname}/template.js`, 'utf8')

      await Promise.all(
        functionsList.map(async ({ name, mainFile }) => {
          const newFunctionName = `${name}.instrumented`

          await rename(mainFile, `${path.dirname(mainFile)}/${newFunctionName}`)

          const wrapper = generateTemplate(template, newFunctionName)
          await writeFile(mainFile, wrapper)
        }),
      )
      status.show({
        summary: `Successfully instrumented ${functionsList.length} Node.js functions`,
      })
    } catch (error) {
      build.failBuild('Unknown error', { error })
    }
  },
}
