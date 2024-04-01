# RackManage-Agent
 
The Rack Manage Agent (`rmagent`) is a lightweight agent that runs on a on-premises server and communicates with the Rack Manage Cloud Service. The agent is responsible for monitoring server uptime by pinging other devices on the network and sending the results to the cloud service.

The agent is written in Node.js and is compiled to a binary using [esbuild](https://esbuild.github.io/) and [pkg](https://www.npmjs.com/package/pkg). The agent is designed to be lightweight and run on a variety of operating systems.

Currently, the build system is configured to use Node.js 18.5.0 and produces binaries for Linux, MacOS, and Windows in both the x64 and ARM64 architectures.

## Development

To get started with development, clone the repository and run the following commands:

```bash
npm install
```

To build the agent for your current platform, first ensure that you have the correct version of Node.js installed. Then run the following command:

```bash
npm run build
```

This will create a binary in the `build` directory that you can run on your local machine.

To build for all platforms, run the following command:

```bash
npm run build:all
```

This will create binaries for Linux, MacOS, and Windows in both the x64 and ARM64 architectures.

Note that all dependencies should be marked as `devDependencies` in the `package.json` file unless they include native modules or are required at runtime, such as `sqlite3`. Any dependencies not marked for dev will be bundled by `pkg` which does not support ES6 modules. By marking dependencies as `devDependencies`, `esbuild` will bundle them into a single file which can then be packaged by `pkg`.