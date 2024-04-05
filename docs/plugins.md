`rmagent plugins`
=================

Manage plugins for the agent

* [`rmagent plugins`](#rmagent-plugins)
* [`rmagent plugins add PLUGIN`](#rmagent-plugins-add-plugin)
* [`rmagent plugins:inspect PLUGIN...`](#rmagent-pluginsinspect-plugin)
* [`rmagent plugins install PLUGIN`](#rmagent-plugins-install-plugin)
* [`rmagent plugins link PATH`](#rmagent-plugins-link-path)
* [`rmagent plugins remove [PLUGIN]`](#rmagent-plugins-remove-plugin)
* [`rmagent plugins reset`](#rmagent-plugins-reset)
* [`rmagent plugins uninstall [PLUGIN]`](#rmagent-plugins-uninstall-plugin)
* [`rmagent plugins unlink [PLUGIN]`](#rmagent-plugins-unlink-plugin)
* [`rmagent plugins update`](#rmagent-plugins-update)

## `rmagent plugins`

List installed plugins.

```
USAGE
  $ rmagent plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ rmagent plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.5/src/commands/plugins/index.ts)_

## `rmagent plugins add PLUGIN`

Installs a plugin into rmagent.

```
USAGE
  $ rmagent plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into rmagent.

  Uses bundled npm executable to install plugins into /Users/roeserc/.local/share/rmagent

  Installation of a user-installed plugin will override a core plugin.

  Use the RMAGENT_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the RMAGENT_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ rmagent plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ rmagent plugins add myplugin

  Install a plugin from a github url.

    $ rmagent plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ rmagent plugins add someuser/someplugin
```

## `rmagent plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ rmagent plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ rmagent plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.5/src/commands/plugins/inspect.ts)_

## `rmagent plugins install PLUGIN`

Installs a plugin into rmagent.

```
USAGE
  $ rmagent plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into rmagent.

  Uses bundled npm executable to install plugins into /Users/roeserc/.local/share/rmagent

  Installation of a user-installed plugin will override a core plugin.

  Use the RMAGENT_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the RMAGENT_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ rmagent plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ rmagent plugins install myplugin

  Install a plugin from a github url.

    $ rmagent plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ rmagent plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.5/src/commands/plugins/install.ts)_

## `rmagent plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ rmagent plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ rmagent plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.5/src/commands/plugins/link.ts)_

## `rmagent plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ rmagent plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ rmagent plugins unlink
  $ rmagent plugins remove

EXAMPLES
  $ rmagent plugins remove myplugin
```

## `rmagent plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ rmagent plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.5/src/commands/plugins/reset.ts)_

## `rmagent plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ rmagent plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ rmagent plugins unlink
  $ rmagent plugins remove

EXAMPLES
  $ rmagent plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.5/src/commands/plugins/uninstall.ts)_

## `rmagent plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ rmagent plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ rmagent plugins unlink
  $ rmagent plugins remove

EXAMPLES
  $ rmagent plugins unlink myplugin
```

## `rmagent plugins update`

Update installed plugins.

```
USAGE
  $ rmagent plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.5/src/commands/plugins/update.ts)_
