`rmagent update`
================

update the rmagent CLI

* [`rmagent update [CHANNEL]`](#rmagent-update-channel)

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

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v4.2.4/src/commands/update.ts)_
