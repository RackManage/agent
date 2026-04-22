`rackmanage ipmi`
=================

Manage IPMI settings for servers

* [`rackmanage ipmi list`](#rackmanage-ipmi-list)
* [`rackmanage ipmi set`](#rackmanage-ipmi-set)
* [`rackmanage ipmi test`](#rackmanage-ipmi-test)

## `rackmanage ipmi list`

List IPMI accounts

```
USAGE
  $ rackmanage ipmi list

DESCRIPTION
  List IPMI accounts

EXAMPLES
  $ rackmanage ipmi list
```

_See code: [src/commands/ipmi/list.ts](https://github.com/RackManage/agent/blob/v0.0.3/src/commands/ipmi/list.ts)_

## `rackmanage ipmi set`

Set IPMI account for a server

```
USAGE
  $ rackmanage ipmi set [-a <value>] [-f <value>] [-p <value>] [-p <value>] [-s <value>] [-u <value>]

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
  $ rackmanage ipmi set
```

_See code: [src/commands/ipmi/set.ts](https://github.com/RackManage/agent/blob/v0.0.3/src/commands/ipmi/set.ts)_

## `rackmanage ipmi test`

Test IPMI connection

```
USAGE
  $ rackmanage ipmi test [-s <value>]

FLAGS
  -s, --server=<value>  Server address

DESCRIPTION
  Test IPMI connection

EXAMPLES
  $ rackmanage ipmi test
```

_See code: [src/commands/ipmi/test.ts](https://github.com/RackManage/agent/blob/v0.0.3/src/commands/ipmi/test.ts)_
