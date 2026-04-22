`rackmanage service`
====================

Manage the agent background service

* [`rackmanage service install`](#rackmanage-service-install)
* [`rackmanage service start`](#rackmanage-service-start)
* [`rackmanage service stop`](#rackmanage-service-stop)
* [`rackmanage service uninstall`](#rackmanage-service-uninstall)

## `rackmanage service install`

Installs the agent service

```
USAGE
  $ rackmanage service install [-f] [-t <value>]

FLAGS
  -f, --force            Force the installation without confirmation
  -t, --trigger=<value>  When to trigger the service (login, boot). Sudo permissions required for boot trigger.

DESCRIPTION
  Installs the agent service

EXAMPLES
  $ rackmanage service install
```

_See code: [src/commands/service/install.ts](https://github.com/RackManage/agent/blob/v0.0.3/src/commands/service/install.ts)_

## `rackmanage service start`

Start the agent service

```
USAGE
  $ rackmanage service start

DESCRIPTION
  Start the agent service

EXAMPLES
  $ rackmanage service start
```

_See code: [src/commands/service/start.ts](https://github.com/RackManage/agent/blob/v0.0.3/src/commands/service/start.ts)_

## `rackmanage service stop`

Stop the agent service

```
USAGE
  $ rackmanage service stop

DESCRIPTION
  Stop the agent service

EXAMPLES
  $ rackmanage service stop
```

_See code: [src/commands/service/stop.ts](https://github.com/RackManage/agent/blob/v0.0.3/src/commands/service/stop.ts)_

## `rackmanage service uninstall`

Uninstalls the agent service

```
USAGE
  $ rackmanage service uninstall

DESCRIPTION
  Uninstalls the agent service

EXAMPLES
  $ rackmanage service uninstall
```

_See code: [src/commands/service/uninstall.ts](https://github.com/RackManage/agent/blob/v0.0.3/src/commands/service/uninstall.ts)_
