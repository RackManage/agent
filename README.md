# Rack Manage Agent

<!-- toc -->
* [Rack Manage Agent](#rack-manage-agent)
* [Requirements](#requirements)
* [Installation](#installation)
* [Usage](#usage)
* [Uninstallation](#uninstallation)
* [Commands](#commands)
* [Security](#security)
* [Development](#development)
<!-- tocstop -->
 
The Rack Manage Agent (`rmagent`) is a service that runs on an on-premises server and communicates with the Rack Manage cloud application. The agent is responsible for monitoring server uptime by pinging other devices on the network and sending the results to the cloud service. Additionally, the agent can connect to hardware via IPMI to send commands to the server, such as chassis identification.

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

### Debian / Ubuntu

To install the agent on Debian or Ubuntu, run the following command (this will automatically install both the agent and the IPMI dependencies):
```bash
curl -sSL https://rmagent-assets.rackmanage.io/install.sh | sh
```

Or download the installer directly:

* [Debian 64-bit](https://rmagent-assets.rackmanage.io/channels/stable/apt/rmagent_0.0.1.c8f57b8-1_amd64.deb)
* [Debian Arm64](https://rmagent-assets.rackmanage.io/channels/stable/apt/rmagent_0.0.1.c8f57b8-1_arm64.deb)
* [Debian Arm](https://rmagent-assets.rackmanage.io/channels/stable/apt/rmagent_0.0.1.c8f57b8-1_armel.deb)

> **_NOTE:_**
> The Debian package does not automatically update the agent. To update the agent, run `sudo apt update && sudo apt install rmagent`, or download the latest installer.


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

> **_NOTE:_**
> `rmagent update` is not supported through the Debian installers. To update the agent, run `sudo apt update && sudo apt install rmagent` instead.

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

For standalone installs, you can uninstall the agent by typing:

```bash
rm -rf /usr/local/lib/rmagent /usr/local/bin/rmagent /usr/local/rmagent ~/.local/share/rmagent ~/.cache/rmagent
```

For Debian installs, you can uninstall the agent by typing:

```bash
sudo apt remove rmagent
sudo rm /etc/apt/sources.list.d/rmagent.list
```

## MacOS
To uninstall the Rack Manage Agent on MacOS, run the following command:

```bash
rm -rf /usr/local/lib/rmagent /usr/local/bin/rmagent /usr/local/rmagent ~/.local/share/rmagent ~/Library/Caches/rmagent
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
Rack Manage Agent is built in Node.js using the [Open CLI Framework](https://oclif.io/) (`oclif`) and is written in TypeScript. Rack Manage Agent does not require Node.js to be installed on the target system as it is bundled with a portable version of Node.js when compiled.

`oclif` may not compile correctly when using `npm`, so it is recommended to use `yarn` for development.

## Development Requirements
- Node.js 18
- oclif
- Yarn

## Getting Started

To get started with development, clone the repository and run the following commands:

```bash
yarn global add oclif
yarn install
```

To test the agent locally, you can run the following command:

```bash
node bin/dev
```

This will run the agent in development mode, which prints debug information to the console.

To preview the agent as it would appear in production, you can run the following command:

```bash
node bin/run
```

## Building the Agent

To build the agent, you must specify the platform to build for, and must build tarballs / installers in separate steps.

### Building for a Specific Platform

To build the agent for a specific platform, run the following command:

```bash
oclif pack tarballs --targets=<platform>-<arch>
```

For example, to build the agent for Linux x64, run the following command:

```bash
oclif pack tarballs --targets=linux-x64
```

### Building Tarballs

To build tarballs for all platforms, run the following command:

```bash
oclif pack tarballs
```

### Building MacOS Installers

To build installers for MacOS, run the following command:

```bash
oclif pack macos
```

This requires that the Apple Developer certificate specified in the `package.json` file is installed on your system. You will be prompted to unlock your keychain to sign the installer.

### Building Windows Installers

To build installers for Windows, run the following command:

```bash
oclif pack windows
```

## Building Debian Packages

To build Debian packages, first, set the `RMAGENT_DEB_KEY` environment variable to the GPG key ID to sign the package with. Then run the following command:

```bash
oclif pack deb
```

This requires that the GPG key specified in the `RMAGENT_DEB_KEY` environment variable is installed on your system. You will be prompted to enter the passphrase for the key.

Debian packages must be built on a Debian-based system, such as Ubuntu.

## Distributing the Agent

To enable automatic updates, the agent must be distributed through an S3 storage service. This is handled automatically through `oclif` and is configured in the `package.json` file under the `oclif.s3` key.

Rack Manage uses Cloudflare R2 rather than AWS S3 for distribution. While `oclif` supports non-AWS S3 storage, there is some additional configuration required to use it.

First, you must set the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables to the Cloudflare R2 credentials. You must also set the `AWS_S3_ENDPOINT` and `AWS_ENDPOINT_URL` environment variables to the Cloudflare R2 endpoint.

```bash
export AWS_ACCESS_KEY_ID=<READ_WRITE_ACCESS_KEY>
export AWS_SECRET_ACCESS_KEY=<SECRET_ACCESS_KEY>
export AWS_S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
export AWS_ENDPOINT_URL=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

Once these environment variables are set, you can upload the agent to Cloudflare R2 by running the following command:

```bash
oclif upload <type>
```

Where `<type>` is the type of file to upload, such as `tarballs`, `macos`, or `win`.

Finally, you can publish the agent to the Cloudflare R2 distribution by running the following command:

```bash
oclif promote --channel <channel> --version <version> --sha <sha> --indexes --xz
```

Where `<channel>` is the release channel to publish to, such as `stable` or `beta`, `<version>` is the version number, and `<sha>` is the 7 character git commit hash.

By default, this command will only publish tarballs. To publish other types of files, you must specify the type with the `-m`, or `-w` flags for deb, macos, and win files, respectively.

### Debian Packages

The Debian commands `oclif upload deb` and `oclif promote -d` do not work properly (see [oclif issue #1074](https://github.com/oclif/oclif/issues/1074)) due to the improper use of `./` as the Debian distribution. 

To work around this, you can manually upload the Debian package to Cloudflare R2 through the `aws` CLI with the following command: 

```bash
aws s3 cp dist/deb s3://rmagent/channels/stable/apt --recursive 
```

In order to handle the cases where Debian attempts to download the package from the `./` directory, a redirect is setup in the Rack Manage Subdomain Router to redirect requests from `https://rmagent-assets.rackmanage.io/channels/stable/apt/./` to `https://rmagent-assets.rackmanage.io/channels/stable/apt/`.

The Debian repository also includes two additional files, `Release.key` and `install.sh` which are used to add the GPG key to the system, and automate the installation of the package. These are manually uploaded to the repository and are not generated by `oclif`.

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
