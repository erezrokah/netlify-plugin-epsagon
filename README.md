Netlify Epsagon Build Plugin - Instrument JavaScript functions with epsagon.

## Installation

There are two ways to install the plugin in your Netlify site: with the Netlify UI or with file-based installation.

**UI-based Installation**

You can install this from your team's [Plugins directory](https://app.netlify.com/plugins) in the Netlify UI.

Read more about [UI-based plugin installation](https://docs.netlify.com/configure-builds/build-plugins/#ui-installation) in our docs.

**File-based Installation**

1. Create a `netlify.toml` in the root of your project. Your file should include the plugins section below:

    ```toml
    [build]
      (...)

    [[plugins]]
      package = "netlify-plugin-epsagon"
    ```

2. From your project's base directory, use `npm`, `yarn`, or any other Node.js package manager to add this plugin to `devDependencies` in `package.json`.

    ```
    npm install -D netlify-plugin-epsagon
    ```

    or

    ```
    yarn add -D netlify-plugin-epsagon
    ```

Read more about [file-based plugin installation](https://docs.netlify.com/configure-builds/build-plugins/#file-based-installation) in our docs.

## Configuration

In order for this plugin to work a [build environment variable](https://docs.netlify.com/configure-builds/environment-variables/)
`EPSAGON_TOKEN` needs to be provided.

The following [plugin `inputs`](https://docs.netlify.com/configure-builds/build-plugins/#configure-settings) are available for further configuration:

* `ignoredKeys`: List of sensitive properties and names to be filtered out from traces (defaults to `["token", "authorization"]`)

