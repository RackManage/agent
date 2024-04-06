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
# Command Topics

* [`rmagent help`](docs/help.md) - Display help for rmagent.
* [`rmagent ipmi`](docs/ipmi.md) - Manage IPMI settings for servers
* [`rmagent login`](docs/login.md) - Connect agent to Rack Manage account
* [`rmagent logout`](docs/logout.md) - Disconnect agent from Rack Manage account
* [`rmagent server`](docs/server.md) - Manage servers monitored by the agent
* [`rmagent service`](docs/service.md) - Manage the agent background service
* [`rmagent status`](docs/status.md) - Check the status of the agent
* [`rmagent update`](docs/update.md) - update the rmagent CLI
* [`rmagent version`](docs/version.md)

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
