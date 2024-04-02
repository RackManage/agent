# RackManage-Agent
 
The Rack Manage Agent (`rmagent`) is a lightweight agent that runs on a on-premises server and communicates with the Rack Manage Cloud Service. The agent is responsible for monitoring server uptime by pinging other devices on the network and sending the results to the cloud service.

The agent is written in Node.js and is compiled to a binary using [esbuild](https://esbuild.github.io/) and [pkg](https://www.npmjs.com/package/pkg). The agent is designed to be lightweight and run on a variety of operating systems.

Currently, the build system is configured to use Node.js 18.5.0 and produces binaries for Linux, MacOS, and Windows in both the x64 and ARM64 architectures.

## Requirements

Rack Manage Agent has limited dependencies and should run on most systems. If there is not a compiled binary for your system, you can build the agent from source.

Basic functionality such as pinging devices and installing the agent to launch on login work without any dependencies, however, some features like launching on startup and IPMI may require additional dependencies.

### Linux
- `libsecret` required for IPMI functionality
  - Debian/Ubuntu: `sudo apt-get install libsecret-1-dev`
  - Red Hat-based: `sudo yum install libsecret-devel`
- `ipmitool` required for IPMI functionality
  - Debian/Ubuntu: `sudo apt-get install ipmitool`
  - Red Hat-based: `sudo yum install OpenIPMI ipmitool`

### MacOS
- `ipmitool` required for IPMI functionality
  - `brew install ipmitool`

### Windows
- .NET Framework 4 or later required for installing agent as a service
  - [Download .NET Framework](https://dotnet.microsoft.com/en-us/download/dotnet-framework)
- `ipmitool` required for IPMI functionality
  - [Download ipmitool](https://www.dell.com/support/home/en-us/drivers/driversdetails?driverid=m63f3)

## Development

### Development Requirements
- Node.js 18
- x64 or ARM64 architecture (recommended to match the target platform for building binaries)

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

Note that all dependencies should be marked as `devDependencies` in the `package.json` file unless they include native modules or are required at runtime, such as `sqlite3` and `keytar`. Any dependencies not marked for dev will be bundled by `pkg` which does not support ES6 modules. By marking dependencies as `devDependencies`, `esbuild` will bundle them into a single file which can then be packaged by `pkg`.

## Service Management
This agent is designed to run as a service in both user and system contexts (on login and on boot) for Linux, Windows, and MacOS, using systemd, launchd, and the Windows Service Manager, respectively. The service is configured to run the agent in the background and restart it if it crashes.

The `src/service` directory contains a subdirectory for each operating system that contains the necessary files to install the service. 

On Linux, the `rmagent-system.service.tpl` and `rmagent-user.service.tpl` files are used to create the systemd service files. 

On MacOS, the `io.rackmanage.rmagent.plist.tpl` file is used to create the launchd service file.

On Windows, the `rmservice.xml` file is used to configure the `rmservice.exe` service wrapper that runs the agent as a service. The Windows service is built on top of the [winsw](https://github.com/winsw/winsw) service wrapper for system wide services and requires .NET Framework 4.0 or later.