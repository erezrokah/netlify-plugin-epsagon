const path = require('path')
const fs = require('fs')
const util = require('util')

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const rename = util.promisify(fs.rename)

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
          const newName = `${name}.instrumented.js`
          const wrapped = template.replace('REQUIRE_PLACEHOLDER', `${newName}`)
          await rename(mainFile, `${path.dirname(mainFile)}/${newName}`)
          await writeFile(mainFile, wrapped)
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
