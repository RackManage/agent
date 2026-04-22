# Rack Manage Agent

[![Build](https://img.shields.io/circleci/build/github/RackManage/agent?style=for-the-badge)](https://app.circleci.com/pipelines/github/RackManage/agent?branch=main)
[![License](https://img.shields.io/github/license/RackManage/agent?style=for-the-badge)](https://github.com/RackManage/agent/blob/main/LICENSE)
![Version](https://img.shields.io/github/package-json/v/RackManage/agent?style=for-the-badge)

The Rack Manage Agent is a CLI service used to monitor server uptime and send commands to servers via IPMI.

For more about Rack Manage see [rackmanage.io](https://rackmanage.io/).

<!-- To get started see [Knowledgebase: Agents](https://support.rackmanage.io/space/RMS/42532865/Agents) -->

# Overview

The Rack Manage Agent is a Node-based CLI that runs on an on-premises server and communicates with the Rack Manage cloud application. The agent is responsible for monitoring server uptime by pinging other devices on the network and sending the results to the cloud service. Additionally, the agent can connect to hardware via IPMI to send commands to the server, such as chassis identification.

# Installation

Visit the Rack Manage support site for installation instructions and download links.

<!-- [![Install Button](https://img.shields.io/badge/Install_rackmanage_agent-11B981?style=for-the-badge)](https://support.rackmanage.io/space/RMS/45154308/Installing+(and+managing)+the+Agent) -->

# Issues

For problems directly related to the CLI, [add an issue on GitHub](https://github.com/cdgco/RackManage-Agent/issues/new).

For other issues, [submit a support ticket](https://support.rackmanage.io/).


<!-- commands -->
# Command Topics

* [`rackmanage help`](docs/help.md) - Display help for rackmanage.
* [`rackmanage ipmi`](docs/ipmi.md) - Manage IPMI settings for servers
* [`rackmanage login`](docs/login.md) - Connect agent to Rack Manage account
* [`rackmanage logout`](docs/logout.md) - Disconnect this device from Rack Manage
* [`rackmanage server`](docs/server.md) - Manage servers monitored by the agent
* [`rackmanage service`](docs/service.md) - Manage the agent background service
* [`rackmanage status`](docs/status.md) - Check the status of the agent
* [`rackmanage update`](docs/update.md) - update the rackmanage CLI
* [`rackmanage version`](docs/version.md)

<!-- commandsstop -->

# Development

For development instructions, head to the [project wiki](https://github.com/RackManage/agent/wiki).
