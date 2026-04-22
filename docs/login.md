`rackmanage login`
==================

Connect agent to Rack Manage account

* [`rackmanage login [TOKEN]`](#rackmanage-login-token)

## `rackmanage login [TOKEN]`

Connect agent to Rack Manage account

```
USAGE
  $ rackmanage login [TOKEN] [--broker-url <value>] [--name <value>]

ARGUMENTS
  [TOKEN]  Enrollment token

FLAGS
  --broker-url=<value>  Broker base URL
  --name=<value>        Friendly device name

DESCRIPTION
  Connect agent to Rack Manage account

EXAMPLES
  $ rackmanage login

  $ rackmanage login abc123

  $ rackmanage login --broker-url https://api.rackmanage.io
```

_See code: [src/commands/login.ts](https://github.com/RackManage/agent/blob/v0.0.3/src/commands/login.ts)_
