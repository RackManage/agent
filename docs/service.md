`rmagent service`
=================

Manage the agent background service

* [`rmagent service install`](#rmagent-service-install)
* [`rmagent service start`](#rmagent-service-start)
* [`rmagent service stop`](#rmagent-service-stop)
* [`rmagent service uninstall`](#rmagent-service-uninstall)

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

_See code: [src/commands/service/install.ts](https://github.com/RackManage/agent/blob/v0.0.1/src/commands/service/install.ts)_

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

_See code: [src/commands/service/start.ts](https://github.com/RackManage/agent/blob/v0.0.1/src/commands/service/start.ts)_

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

_See code: [src/commands/service/stop.ts](https://github.com/RackManage/agent/blob/v0.0.1/src/commands/service/stop.ts)_

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

_See code: [src/commands/service/uninstall.ts](https://github.com/RackManage/agent/blob/v0.0.1/src/commands/service/uninstall.ts)_
