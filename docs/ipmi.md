`rmagent ipmi`
==============

Manage IPMI settings for servers

* [`rmagent ipmi list`](#rmagent-ipmi-list)
* [`rmagent ipmi set`](#rmagent-ipmi-set)
* [`rmagent ipmi test`](#rmagent-ipmi-test)

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

_See code: [src/commands/ipmi/list.ts](https://github.com/RackManage/agent/blob/v0.0.1/src/commands/ipmi/list.ts)_

## `rmagent ipmi set`

Set IPMI account for a server

```
USAGE
  $ rmagent ipmi set [-a <value>] [-f <value>] [-p <value>] [-p <value>] [-s <value>] [-u
    <value>]

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

_See code: [src/commands/ipmi/set.ts](https://github.com/RackManage/agent/blob/v0.0.1/src/commands/ipmi/set.ts)_

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

_See code: [src/commands/ipmi/test.ts](https://github.com/RackManage/agent/blob/v0.0.1/src/commands/ipmi/test.ts)_
