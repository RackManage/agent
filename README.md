# Rack Manage Agent

<!-- toc -->
* [Rack Manage Agent](#rack-manage-agent)
* [Requirements](#requirements)
* [Installation](#installation)
* [Usage](#usage)
* [Commands](#commands)
* [Security](#security)
* [Development](#development)
<!-- tocstop -->
 
The Rack Manage Agent (`rmagent`) is a lightweight agent that runs on an on-premises server and communicates with the Rack Manage Cloud Service. The agent is responsible for monitoring server uptime by pinging other devices on the network and sending the results to the cloud service.

The agent is written in Node.js and is compiled to a binary using [esbuild](https://esbuild.github.io/) and [pkg](https://www.npmjs.com/package/pkg). The agent is designed to be lightweight and run on a variety of operating systems.

Currently, the build system is configured to use Node.js 18.5.0 and produces binaries for Linux, MacOS, and Windows in both the x64 and ARM64 architectures.

# Requirements

Rack Manage Agent has limited dependencies and should run on most systems. If there is not a compiled binary for your system, you can build the agent from source.

Basic functionality such as pinging devices and installing the agent to launch on login work without any dependencies, however, some features like launching on startup and IPMI may require additional dependencies.

## Linux
- `libsecret` required for IPMI functionality
  - Debian/Ubuntu: `sudo apt-get install libsecret-1-dev`
  - Red Hat-based: `sudo yum install libsecret-devel`
  - Arch: `sudo pacman -S libsecret`
  - Alpine: `apk add libsecret-dev`
- `ipmitool` required for IPMI functionality
  - Debian/Ubuntu: `sudo apt-get install ipmitool`
  - Red Hat-based: `sudo yum install OpenIPMI ipmitool`
  - Arch: `sudo pacman -S ipmitool`
  - Alpine: `apk add ipmitool`

## MacOS
- `ipmitool` required for IPMI functionality
  - `brew install ipmitool`

## Windows
- .NET Framework 4 or later required for installing agent as a service
  - [Download .NET Framework](https://dotnet.microsoft.com/en-us/download/dotnet-framework)
- `ipmitool` required for IPMI functionality
  - [Download ipmitool](https://www.dell.com/support/home/en-us/drivers/driversdetails?driverid=m63f3)

# Installation

The Rack Manage Agent is available through either a platform specific installer, or a standalone tarball containing a binary.

## Install with an Installer

### Linux

Debian based installers coming soon.

### Windows

* [Windows 64-bit](https://rmagent-assets.rackmanage.io/channels/stable/rmagent-x64.exe)
* [Windows 32-bit](https://rmagent-assets.rackmanage.io/channels/stable/rmagent-x86.exe)

### MacOS

* [MacOS (Intel Based)](https://rmagent-assets.rackmanage.io/channels/stable/rmagent-x64.pkg)
* [MacOS (Apple Silicon)](https://rmagent-assets.rackmanage.io/channels/stable/rmagent-arm64.pkg)


## Standalone Installation with a Tarball

### Linux
* [Linux x64](https://rmagent-assets.rackmanage.io/channels/stable/rmagent-linux-x64.tar.gz)
* [Linux ARM64](https://rmagent-assets.rackmanage.io/channels/stable/rmagent-linux-arm64.tar.gz)
* [Linux ARM](https://rmagent-assets.rackmanage.io/channels/stable/rmagent-linux-arm.tar.gz)

### Windows
* [Windows 64-bit](https://rmagent-assets.rackmanage.io/channels/stable/rmagent-win32-x64.tar.gz)
* [Windows 32-bit](https://rmagent-assets.rackmanage.io/channels/stable/rmagent-win32-x86.tar.gz)

### MacOS
* [MacOS (Intel Based)](https://rmagent-assets.rackmanage.io/channels/stable/rmagent-darwin-x64.tar.gz)
* [MacOS (Apple Silicon)](https://rmagent-assets.rackmanage.io/channels/stable/rmagent-darwin-arm64.tar.gz)

## Verify your Installation

```bash
$ rmagent --version
rmagent/0.0.1 darwin-arm64 node-v18.20.0
```

# Usage

## Getting Started

To get started with the Rack Manage Agent, you'll need to log in with your Rack Manage account. In order to login, you must generate an agent token from Rack Manage.

```bash
$ rmagent login
Enter agent token: <token>

Successfully logged in as <username>
```

## Staying Up to Date

The Rack Manage Agent is designed to automatically update itself when new versions are available. You can also manually check for updates by running:

```bash
$ rmagent update
```

To update to a specific version, you can specify the version number:

```bash
$ rmagent update --version 0.0.1
```

or choose an available version:

```bash
$ rmagent update --interactive
```

### Release Channels

The rack manage agent is available in the following release channels:
* `stable` - The latest stable release
* `beta` - The latest beta release

You can specify a channel when updating the agent:

```bash
$ rmagent update beta
```

# Uninstallation

## Linux
### Standalone Install

For standalone installs, you can uninstall the agent by typing:

```bash
rm -rf /usr/local/lib/rmagent /usr/local/bin/rmagent /usr/local/rmagent 
rm -rf ~/.local/share/rmagent ~/.cache/rmagent
```

### Debian and Ubuntu Installs
For Debian/Ubuntu, you can uninstall the agent by typing:

```bash
sudo apt-get remove heroku heroku-toolbelt
sudo rm /etc/apt/sources.list.d/heroku.list
```

## MacOS
To uninstall the Rack Manage Agent on MacOS, run the following command:

```bash
rm -rf /usr/local/lib/rmagent /usr/local/bin/rmagent /usr/local/rmagent
rm -rf ~/.local/share/rmagent ~/Library/Caches/rmagent
```

## Windows

On Windows, to uninstall the Rack Manage Agent, follow these steps:

* From the Start menu, click Control Panel, Programs, and then Program and Features..
* Select Rack Manage Agent, and then click Uninstall. The uninstaller is unsigned.

# Commands
<!-- commands -->
* [`rmagent help [COMMAND]`](#rmagent-help-command)
* [`rmagent ipmi list`](#rmagent-ipmi-list)
* [`rmagent ipmi set`](#rmagent-ipmi-set)
* [`rmagent ipmi test`](#rmagent-ipmi-test)
* [`rmagent login [TOKEN]`](#rmagent-login-token)
* [`rmagent logout`](#rmagent-logout)
* [`rmagent plugins`](#rmagent-plugins)
* [`rmagent plugins add PLUGIN`](#rmagent-plugins-add-plugin)
* [`rmagent plugins:inspect PLUGIN...`](#rmagent-pluginsinspect-plugin)
* [`rmagent plugins install PLUGIN`](#rmagent-plugins-install-plugin)
* [`rmagent plugins link PATH`](#rmagent-plugins-link-path)
* [`rmagent plugins remove [PLUGIN]`](#rmagent-plugins-remove-plugin)
* [`rmagent plugins reset`](#rmagent-plugins-reset)
* [`rmagent plugins uninstall [PLUGIN]`](#rmagent-plugins-uninstall-plugin)
* [`rmagent plugins unlink [PLUGIN]`](#rmagent-plugins-unlink-plugin)
* [`rmagent plugins update`](#rmagent-plugins-update)
* [`rmagent server add`](#rmagent-server-add)
* [`rmagent server list`](#rmagent-server-list)
* [`rmagent service install`](#rmagent-service-install)
* [`rmagent service start`](#rmagent-service-start)
* [`rmagent service stop`](#rmagent-service-stop)
* [`rmagent service uninstall`](#rmagent-service-uninstall)
* [`rmagent status`](#rmagent-status)
* [`rmagent update [CHANNEL]`](#rmagent-update-channel)
* [`rmagent version`](#rmagent-version)

## `rmagent help [COMMAND]`

Display help for rmagent.

```
USAGE
  $ rmagent help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for rmagent.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.0.20/src/commands/help.ts)_

## `rmagent ipmi list`

List IPMI accounts

```
USAGE
  $ rmagent ipmi list

DESCRIPTION
  List IPMI accounts

EXAMPLES
  $ rmagent ipmi list
```

_See code: [src/commands/ipmi/list.ts](https://github.com/cdgco/RackManage-Agent/blob/v0.0.1/src/commands/ipmi/list.ts)_

## `rmagent ipmi set`

Set IPMI account for a server

```
USAGE
  $ rmagent ipmi set [-a <value>] [-f <value>] [-p <value>] [-p <value>] [-s <value>] [-u <value>]

FLAGS
  -a, --address=<value>   IPMI address
  -f, --flags=<value>     Extra ipmitool flags
  -p, --password=<value>  IPMI password
  -p, --port=<value>      Port to monitor
  -s, --server=<value>    Server address
  -u, --username=<value>  IPMI username

DESCRIPTION
  Set IPMI account for a server

EXAMPLES
  $ rmagent ipmi set
```

_See code: [src/commands/ipmi/set.ts](https://github.com/cdgco/RackManage-Agent/blob/v0.0.1/src/commands/ipmi/set.ts)_

## `rmagent ipmi test`

Test IPMI connection

```
USAGE
  $ rmagent ipmi test [-s <value>]

FLAGS
  -s, --server=<value>  Server address

DESCRIPTION
  Test IPMI connection

EXAMPLES
  $ rmagent ipmi test
```

_See code: [src/commands/ipmi/test.ts](https://github.com/cdgco/RackManage-Agent/blob/v0.0.1/src/commands/ipmi/test.ts)_

## `rmagent login [TOKEN]`

Connect agent to Rack Manage account

```
USAGE
  $ rmagent login [TOKEN]

ARGUMENTS
  TOKEN  Agent token

DESCRIPTION
  Connect agent to Rack Manage account

EXAMPLES
  $ rmagent login
```

_See code: [src/commands/login.ts](https://github.com/cdgco/RackManage-Agent/blob/v0.0.1/src/commands/login.ts)_

## `rmagent logout`

Disconnect agent from Rack Manage account

```
USAGE
  $ rmagent logout

DESCRIPTION
  Disconnect agent from Rack Manage account

EXAMPLES
  $ rmagent logout
```

_See code: [src/commands/logout.ts](https://github.com/cdgco/RackManage-Agent/blob/v0.0.1/src/commands/logout.ts)_

## `rmagent plugins`

List installed plugins.

```
USAGE
  $ rmagent plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ rmagent plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.5/src/commands/plugins/index.ts)_

## `rmagent plugins add PLUGIN`

Installs a plugin into rmagent.

```
USAGE
  $ rmagent plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into rmagent.

  Uses bundled npm executable to install plugins into /Users/roeserc/.local/share/rmagent

  Installation of a user-installed plugin will override a core plugin.

  Use the RMAGENT_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the RMAGENT_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ rmagent plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ rmagent plugins add myplugin

  Install a plugin from a github url.

    $ rmagent plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ rmagent plugins add someuser/someplugin
```

## `rmagent plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ rmagent plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ rmagent plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.5/src/commands/plugins/inspect.ts)_

## `rmagent plugins install PLUGIN`

Installs a plugin into rmagent.

```
USAGE
  $ rmagent plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into rmagent.

  Uses bundled npm executable to install plugins into /Users/roeserc/.local/share/rmagent

  Installation of a user-installed plugin will override a core plugin.

  Use the RMAGENT_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the RMAGENT_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ rmagent plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ rmagent plugins install myplugin

  Install a plugin from a github url.

    $ rmagent plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ rmagent plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.5/src/commands/plugins/install.ts)_

## `rmagent plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ rmagent plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ rmagent plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.5/src/commands/plugins/link.ts)_

## `rmagent plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ rmagent plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ rmagent plugins unlink
  $ rmagent plugins remove

EXAMPLES
  $ rmagent plugins remove myplugin
```

## `rmagent plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ rmagent plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.5/src/commands/plugins/reset.ts)_

## `rmagent plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ rmagent plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ rmagent plugins unlink
  $ rmagent plugins remove

EXAMPLES
  $ rmagent plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.5/src/commands/plugins/uninstall.ts)_

## `rmagent plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ rmagent plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ rmagent plugins unlink
  $ rmagent plugins remove

EXAMPLES
  $ rmagent plugins unlink myplugin
```

## `rmagent plugins update`

Update installed plugins.

```
USAGE
  $ rmagent plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.5/src/commands/plugins/update.ts)_

## `rmagent server add`

Add a server

```
USAGE
  $ rmagent server add [-i <value>] [-a <value>] [-f <value>] [-P <value>] [-o <value>] [-u <value>] [-m
    <value>] [-n <value>] [-p <value>] [-s <value>]

FLAGS
  -P, --ipmiPassword=<value>  IPMI password
  -a, --ipmiAddress=<value>   IPMI address
  -f, --ipmiFlags=<value>     Extra ipmitool flags
  -i, --interval=<value>      Interval in minutes
  -m, --mode=<value>          Monitoring mode (tcp, udp, http, https)
  -n, --name=<value>          Name of the server
  -o, --ipmiPort=<value>      IPMI port
  -p, --port=<value>          Port to monitor
  -s, --server=<value>        Server address
  -u, --ipmiUsername=<value>  IPMI username

DESCRIPTION
  Add a server

EXAMPLES
  $ rmagent server add
```

_See code: [src/commands/server/add.ts](https://github.com/cdgco/RackManage-Agent/blob/v0.0.1/src/commands/server/add.ts)_

## `rmagent server list`

List all servers

```
USAGE
  $ rmagent server list

DESCRIPTION
  List all servers

EXAMPLES
  $ rmagent server list
```

_See code: [src/commands/server/list.ts](https://github.com/cdgco/RackManage-Agent/blob/v0.0.1/src/commands/server/list.ts)_

## `rmagent service install`

Installs the agent service

```
USAGE
  $ rmagent service install [-f] [-t <value>]

FLAGS
  -f, --force            Force the installation without confirmation
  -t, --trigger=<value>  When to trigger the service (login, boot). Sudo permissions required for boot trigger.

DESCRIPTION
  Installs the agent service

EXAMPLES
  $ rmagent service install
```

_See code: [src/commands/service/install.ts](https://github.com/cdgco/RackManage-Agent/blob/v0.0.1/src/commands/service/install.ts)_

## `rmagent service start`

Start the agent service

```
USAGE
  $ rmagent service start

DESCRIPTION
  Start the agent service

EXAMPLES
  $ rmagent service start
```

_See code: [src/commands/service/start.ts](https://github.com/cdgco/RackManage-Agent/blob/v0.0.1/src/commands/service/start.ts)_

## `rmagent service stop`

Stop the agent service

```
USAGE
  $ rmagent service stop

DESCRIPTION
  Stop the agent service

EXAMPLES
  $ rmagent service stop
```

_See code: [src/commands/service/stop.ts](https://github.com/cdgco/RackManage-Agent/blob/v0.0.1/src/commands/service/stop.ts)_

## `rmagent service uninstall`

Uninstalls the agent service

```
USAGE
  $ rmagent service uninstall

DESCRIPTION
  Uninstalls the agent service

EXAMPLES
  $ rmagent service uninstall
```

_See code: [src/commands/service/uninstall.ts](https://github.com/cdgco/RackManage-Agent/blob/v0.0.1/src/commands/service/uninstall.ts)_

## `rmagent status`

Check the status of the agent

```
USAGE
  $ rmagent status

DESCRIPTION
  Check the status of the agent

EXAMPLES
  $ rmagent status
```

_See code: [src/commands/status.ts](https://github.com/cdgco/RackManage-Agent/blob/v0.0.1/src/commands/status.ts)_

## `rmagent update [CHANNEL]`

update the rmagent CLI

```
USAGE
  $ rmagent update [CHANNEL] [-a] [--force] [-i | -v <value>]

FLAGS
  -a, --available        See available versions.
  -i, --interactive      Interactively select version to install. This is ignored if a channel is provided.
  -v, --version=<value>  Install a specific version.
      --force            Force a re-download of the requested version.

DESCRIPTION
  update the rmagent CLI

EXAMPLES
  Update to the stable channel:

    $ rmagent update stable

  Update to a specific version:

    $ rmagent update --version 1.0.0

  Interactively select version:

    $ rmagent update --interactive

  See available versions:

    $ rmagent update --available
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v4.2.3/src/commands/update.ts)_

## `rmagent version`

```
USAGE
  $ rmagent version [--json] [--verbose]

FLAGS
  --verbose  Show additional information about the CLI.

GLOBAL FLAGS
  --json  Format output as json.

FLAG DESCRIPTIONS
  --verbose  Show additional information about the CLI.

    Additionally shows the architecture, node version, operating system, and versions of plugins that the CLI is using.
```

_See code: [@oclif/plugin-version](https://github.com/oclif/plugin-version/blob/v2.0.16/src/commands/version.ts)_
<!-- commandsstop -->

# Security

The Rack Manage Agent prioritizes security and privacy, ensuring that your sensitive information is safeguarded at all times:

## Data Protection
The agent solely transmits the outcomes of diagnostic checks, such as pings, to the Rack Manage Cloud Service. No sensitive data or credentials are ever sent.

## Secure Credential Storage
IPMI credentials are securely stored in the system's keychain, accessible only by the current user with the proper authentication. This ensures that your credentials are never exposed to external services.

## Communication Security
The agent operates quietly in the background, maintaining communication strictly with the Rack Manage Cloud Service over secure HTTPS connections. It connects exclusively to trusted endpoints (`auth.rackmanage.io` & `rmagent.firebaseio.com`), ensuring that your data is always transmitted securely.

## Authentication
Authentication with the Rack Manage Cloud Service is performed using a unique API key generated by the service which expires shortly after generation. This key facilitates the initial login process and is not stored on your device, preserving your system's security.

## User Control
Agents can be disabled or completely removed from the Rack Manage Cloud Service at any time. Disabling or deleting an agent immediately terminates its ability to send data, safeguarding your privacy.

## Open Source
The Rack Manage Agent is open source, allowing you to inspect, review, and understand exactly what you're installing.

# Development

## Development Requirements
- Node.js 18

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

## Testing IPMI

To test IPMI without connecting to a real device, you can use the [`ipmi-simulator`](https://github.com/vapor-ware/ipmi-simulator) docker image.

To run the simulator, use the following command:

```bash
docker run -d -p 623:623/udp vaporio/ipmi-simulator
```

This will start the simulator on port 623. You can then test the agent's IPMI functionality by adding an IPMI device in the agent like so:

```bash
rmagent ipmi -s <server-address> -a localhost -u ADMIN -p ADMIN
```

## Future Work

The Rack Manage Agent is under active development, and we are continuously working to improve it. Some features we are considering for future releases include:
* Move from `commander` to `oclif` for a more robust CLI
  * Add IPMI as an optional plugin
  * Support automatic updates
* Sign binaries for Windows and MacOS
