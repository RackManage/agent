# Rack Manage Agent

The Rack Manage Agent is used to monitor server uptime and send commands to servers via IPMI.

For more about Rack Manage see [rackmanage.io](https://rackmanage.io/).

To get started see [Knowledgebase: Agents](https://support.rackmanage.io/space/RMS/42532865/Agents)

# Overview

The Rack Manage Agent (`rmagent`) is a Node-based CLI that runs on an on-premises server and communicates with the Rack Manage cloud application. The agent is responsible for monitoring server uptime by pinging other devices on the network and sending the results to the cloud service. Additionally, the agent can connect to hardware via IPMI to send commands to the server, such as chassis identification.

# Installation

To install the agent, please see the [installation instructions](https://support.rackmanage.io/space/RMS/45154308/Installing+(and+managing)+the+Agent) from the Rack Manage Support Knowledgebase.

# Issues

For problems directly related to the CLI, [add an issue on GitHub](https://github.com/cdgco/RackManage-Agent/issues/new).

For other issues, [submit a support ticket](https://support.rackmanage.io/).


<!-- commands -->
* [`rmagent help [COMMAND]`](#rmagent-help-command)
* [`rmagent ipmi list`](#rmagent-ipmi-list)
* [`rmagent ipmi set`](#rmagent-ipmi-set)
* [`rmagent ipmi test`](#rmagent-ipmi-test)
* [`rmagent login [TOKEN]`](#rmagent-login-token)
* [`rmagent logout`](#rmagent-logout)
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

Developing
==========

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

### Cloudflare R2 Configuration

The Rack Manage Agent R2 server is configured to use the `rmagent` bucket on the `agent.rackmanage.io` domain. This domain is registered in the Rack Manage Subdomain Router and is excluded in the banned names list of the cloud functions repository.

First, you must set the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables to the Cloudflare R2 credentials. You must also set the `AWS_ENDPOINT_URL_S3` variable to the Cloudflare R2 endpoint.

```bash
export AWS_ACCESS_KEY_ID=<READ_WRITE_ACCESS_KEY>
export AWS_SECRET_ACCESS_KEY=<SECRET_ACCESS_KEY>
export AWS_ENDPOINT_URL_S3=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
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

By default, this command will only publish tarballs. To publish other types of files, you must specify the type with the `-m`, or `-w` flags for macos, and win files, respectively.

### Debian Packages

The Debian commands `oclif upload deb` and `oclif promote -d` do not work properly (see [oclif issue #1074](https://github.com/oclif/oclif/issues/1074)) due to the use of `./` as the Debian distribution, where S3 does not support folders named `.`.

To work around this, you can manually upload the Debian package to Cloudflare R2 through the `aws` CLI with the following command: 

```bash
aws s3 cp dist/deb s3://rmagent/apt --recursive 
```

In order to handle the cases where Debian attempts to download the package from the `./` directory, a redirect is setup in the Rack Manage Subdomain Router to redirect requests from `https://agent.rackmanage.io/apt/./` to `https://agent.rackmanage.io/apt/`. Note that the apt reposity does not support release channels and only the latest version is available.

The Debian repository also includes two additional files, `Release.key` and `install.sh` which are used to add the GPG key to the system, and automate the installation of the package. These are manually uploaded to the repository and are not generated by `oclif`. `install.sh` is located in the `scripts` directory and `Release.key` is not included in the repository.

To update `install.sh` and `Release.key`, run the following commands:

```bash
aws s3 cp scripts/install.sh s3://rmagent/install.sh
```

```bash
aws s3 cp Release.key s3://rmagent/apt/Release.key
```

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
