# Rack Manage Agent

[![Build](https://img.shields.io/circleci/build/github/RackManage/agent?style=for-the-badge)](https://app.circleci.com/pipelines/github/RackManage/agent?branch=main)
[![License](https://img.shields.io/github/license/RackManage/agent?style=for-the-badge)](https://github.com/RackManage/agent/blob/main/LICENSE)
[![Version](https://img.shields.io/github/package-json/v/RackManage/agent?style=for-the-badge)](https://support.rackmanage.io/space/RMS/45154308/Installing+(and+managing)+the+Agent)

The Rack Manage Agent is a CLI service used to monitor server uptime and send commands to servers via IPMI.

For more about Rack Manage see [rackmanage.io](https://rackmanage.io/).

To get started see [Knowledgebase: Agents](https://support.rackmanage.io/space/RMS/42532865/Agents)

# Overview

The Rack Manage Agent (`rmagent`) is a Node-based CLI that runs on an on-premises server and communicates with the Rack Manage cloud application. The agent is responsible for monitoring server uptime by pinging other devices on the network and sending the results to the cloud service. Additionally, the agent can connect to hardware via IPMI to send commands to the server, such as chassis identification.

# Installation

Visit the Rack Manage support site for installation instructions and download links.

[![Install Button](https://img.shields.io/badge/Install_rmagent-11B981?style=for-the-badge)](https://support.rackmanage.io/space/RMS/45154308/Installing+(and+managing)+the+Agent)

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
- Node.js 20+
- Yarn
- libsecret dev (for Linux development)
- .NET Framework 4.5 (for Windows development)
- p7zip / 7-Zip (for building Windows installers)
- nsis (for building Windows installers)
- apt-utils (for building Debian packages)

## Getting Started

To get started with development, clone the repository and run the following commands:

```bash
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

Signing with the Certum certificate cannot be performed via `oclif` and must be done manually. To sign the installers, run the following command:

```bash
signtool sign /n "Carter Roeser" /fd SHA256 /tr http://time.certum.pl /td sha256 /v <path-to-installer>
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

The Debian repository also includes two additional files, `Release.key` and `install.sh` which are used to add the GPG key to the system, and automate the installation of the package. `install.sh` is located in the `scripts` directory, while `Release.key` is not stored in the repository. Both files are automatically uploaded / generated during the CircleCI build process.

To update `install.sh` and `Release.key` manually, run the following commands:

```bash
aws s3 cp scripts/install.sh s3://rmagent/install.sh
```

```bash
aws s3 cp Release.key s3://rmagent/apt/Release.key
```

## Automated Builds

[![CircleCI](https://dl.circleci.com/insights-snapshot/gh/RackManage/agent/main/build_and_release/badge.svg?window=30d)](https://app.circleci.com/insights/github/RackManage/agent?branches=main&workflows=build_and_release&reporting-window=last-30-days&insights-snapshot=true)


The agent is built and distributed automatically through CircleCI. The build process is defined in the `.circleci/config.yml` file and is triggered by pushing tags to the repository. Pushing tags will trigger builds to the `stable` release channel.

Manual builds can be triggered in CircleCI by running `Trigger Pipeline` on the `main` branch with the `channel` parameter set to the desired release channel (`stable` or `beta`). Beta builds will not update the apt repository as it does not support release channels.

Beta releases are not run automatically due to the cost of MacOS builds. To run a beta build, you must manually trigger the build in CircleCI.

Version numbers are pulled from the `package.json` file and are used to publish to Cloudflare R2 / the CLI `update` command. Git version tags are ignored in the build process and are for reference only.

Documentation should also be updated with each release to reflect changes in the agent. This can be done by running the following command:

```bash
yarn run version
```

The build process relies on the following environment variables:

| Variable                      | Value                                                                      |
| ----------------------------- | -------------------------------------------------------------------------- |
| APPLE_ID                      | Apple ID Username of Developer Account                                     |
| APPLE_ID_APP_PASSWORD         | App-Specific Password for Developer Account                                |
| APPLE_TEAM_ID                 | Apple Developer Team ID                                                    |
| AWS_ACCESS_KEY_ID             | Cloudflare R2 Read / Write Access Key                                      |
| AWS_ENDPOINT_URL_S3           | Cloudflare R2 Endpoint URL `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| AWS_SECRET_ACCESS_KEY         | Cloudflare R2 Secret Access Key                                            |
| GPG_PASSPHRASE                | GPG Passphrase for Signing Debian Packages                                 |
| GPG_PRIVATE_KEY               | GPG Private Key for Signing Debian Packages (base64 encoded armored)       |
| GPG_PUBLIC_KEY                | GPG Public Key for Signing Debian Packages (base64 encoded armored)        |
| OSX_APPLICATION_CERT_BASE64   | Apple Developer Application Certificate (base64 encoded p12)               |
| OSX_APPLICATION_CERT_PASSWORD | Password for Application Certificate                                       |
| OSX_INSTALLER_CERT_BASE64     | Apple Developer Installer Certificate (base64 encoded p12)                 |
| OSX_INSTALLER_CERT_PASSWORD   | Password for Installer Certificate                                         |
| RMAGENT_DEB_KEY               | GPG Key ID for Signing Debian Packages                                     |

To obtain Apple Developer Certificates, you must export them from the Apple Developer Portal, add them to a keychain, and export them as a `.p12` file from the "My Certificates" section of the keychain. The `.p12` file must be base64 encoded with `base64 -b 0` / `base64 -w 0` before adding it to the environment variable.

To obtain the GPG keys, you must export the public and private keys with `gpg -a --export` and `gpg -a --export-secret-keys`, respectively, and base64 encode them with `base64 -b 0` / `base64 -w 0` before adding them to the environment variable.

The public key should also be uploaded to the Ubuntu keyserver with `gpg --send-keys <key-id> --keyserver keyserver.ubuntu.com`.

The build process will also update `install.sh` and the `Release.key` file in the Debian repository using the public key in the `GPG_PUBLIC_KEY` environment variable.

### Signing Windows Installers
Windows installers are signed with a Certum Open Source Code Signing Certificate. Due to the smart card / HSM requirements for signing Windows installers, the Windows installer is not signed during the build process.

To sign the installer, run the `scripts/sign-windows-installer.ps1` script with the following command:

```powershell
.\scripts\sign-windows-installer.ps1 -version <version> -sha <sha> [-promote <channel>]
```

Where `<version>` is the version number to sign (e.g. `1.0.0`) and `<sha>` is the 7 character short commit hash of the installer. The `-promote` flag is optional and will promote the installer to the specified release channel after signing. The script requires that `signtool` and `aws` are installed and in the system path, and that the `AWS_` environment variables are set as described above. The certificate must be installed in the system certificate store. For signing with the Certum Code Signing Certificate, the Certum SimplySign utility must be installed and logged in.

## Deleting Versions
oclif does not provide any built in method to delete old versions from S3 storage. To remove previous versions from the update server, use the following command:

```bash
./scripts/delete-s3-version.sh <version>
```

Where `<version>` is the version number to delete (e.g. `1.0.0`).

You must have `jq` and `aws` installed to run this script, and your S3 credentials must be set in the `AWS_` environment variables as described above.

Note that this does not remove the latest version from the public / beta release channels or the apt repo, it only removes the ability for users to update to that specific version from the CLI.

## Service Management
This agent is designed to run as a service in both user and system contexts (on login and on boot) for Linux, Windows, and MacOS, using systemd, launchd, and the Windows Service Manager, respectively. The service is configured to run the agent in the background and restart it if it crashes.

The `src/service` directory contains a subdirectory for each operating system that contains the necessary files to install the service. 

On Linux, the `rmagent-system.service.tpl` and `rmagent-user.service.tpl` files are used to create the systemd service files. 

On MacOS, the `io.rackmanage.rmagent.plist.tpl` file is used to create the launchd service file.

On Windows, the `rmservice.xml.tpl` file is used to configure the `rmservice.exe` service wrapper that runs the agent as a service. The Windows service is built on top of the [winsw](https://github.com/winsw/winsw) service wrapper for system wide services and requires .NET Framework 4.0 or later.

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
