import {Command, Flags} from '@oclif/core'
const os = require("node:os");
const promptly = require("promptly");

import { closeDb, openOrCreateDatabase } from '../../db'
import { checkAndRefreshToken } from '../../firebase/auth'
import { manageService } from '../../service'

export default class Install extends Command {
  static description = 'Installs the agent service'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    force: Flags.boolean({char: 'f', description: 'Force the installation without confirmation'}),
    trigger: Flags.string({char: 't', description: `When to trigger the service (login, boot). ${os.platform() === "win32" ? "Admin" : "Sudo"} permissions required for boot trigger.`}),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Install)
    const db = await openOrCreateDatabase();
    if (!(await checkAndRefreshToken(db))) return;
    await closeDb(db);

    let { trigger } = flags;

    if (!trigger) {
      trigger = await promptly.choose("When to trigger the service (login, boot): ", ["login", "boot"]);
    }

    const { force } = flags;

    if (trigger === "boot" && !force) {
      console.log(
        `\nNote: When installing the service to start at boot, you must run all future commands as ${os.platform() === "win32" ? "admin" : "sudo"}.`
      );
      const confirm = await promptly.confirm(
        "Are you sure you want to continue? (y/n): "
      );

      if (!confirm || confirm === "n") {
        console.log("\nInstallation cancelled.");
        return;
      }
    }

    console.log("");

    await manageService("install", trigger);
  }
}
