const path = require('path')
const fs = require('fs')
const util = require('util')

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const rename = util.promisify(fs.rename)

const BUILD_ENVS = ['HEAD', 'BUILD_ID', 'CONTEXT', 'COMMIT_REF', 'SITE_NAME']

const generateTemplate = (content, newFunctionName, { inputs }) => {
  // Replace require entry with the original function
  const template = content.replace('REQUIRE_PLACEHOLDER', `${newFunctionName}`)

  // Inject inputs
  const templateWithInputs = Object.entries(inputs).reduce(
    (acc, [inputKey, inputValue]) => {
      const inputToChange = `inputs.${inputKey}`
      if (typeof inputValue === 'string') {
        return acc.replace(inputToChange, `'${inputValue}'`)
      }
      if (typeof inputValue === 'number') {
        return acc.replace(inputToChange, `${inputValue}`)
      }
      return acc.replace(inputToChange, `${JSON.stringify(inputValue)}`)
    },
    template,
  )

  // Inject env vars from build step
  return BUILD_ENVS.reduce(
    (acc, env) =>
      acc.replace(`process.env.${env}`, `'${process.env[env] || env}'`),
    templateWithInputs,
  )
}

module.exports = {
  async onBuild({ utils: { build, status, functions }, inputs }) {
    if (!process.env.EPSAGON_TOKEN) {
      return build.failBuild(
        'Please configure EPSAGON_TOKEN as an environment variable',
      )
    }

    const functionsList = await functions.list({ runtime: 'js' })
    const template = await readFile(`${__dirname}/template.js`, 'utf8')

    try {
      await Promise.all(
        functionsList.map(async ({ name, mainFile }) => {
          const newFunctionName = `${name}.instrumented`

          await rename(mainFile, `${path.dirname(mainFile)}/${newFunctionName}`)

          const wrapper = generateTemplate(template, newFunctionName, {
            inputs,
          })
          await writeFile(mainFile, wrapper)
        }),
      )
    } catch (error) {
      build.failBuild('Failed to instrument functions', { error })
    }
    status.show({
      summary: `Successfully instrumented ${functionsList.length} Node.js functions`,
    })
  },
}
