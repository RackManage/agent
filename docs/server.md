`rmagent server`
================

Manage servers monitored by the agent

* [`rmagent server add`](#rmagent-server-add)
* [`rmagent server list`](#rmagent-server-list)

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

_See code: [src/commands/server/add.ts](https://github.com/RackManage/agent/blob/v0.0.1/src/commands/server/add.ts)_

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

_See code: [src/commands/server/list.ts](https://github.com/RackManage/agent/blob/v0.0.1/src/commands/server/list.ts)_
