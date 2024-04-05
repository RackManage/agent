import {Command, Flags} from '@oclif/core'
const promptly = require("promptly");

import { closeDb, openOrCreateDatabase } from '../../db/index'
import { checkAndRefreshToken } from '../../firebase/auth'
import { ipmiAvailable, runIpmiCommand } from '../../ipmi/index'

export default class Test extends Command {
  static description = 'Test IPMI connection'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    server: Flags.string({char: 's', description: 'Server address'}),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Test)

    if (! await ipmiAvailable()) {
      console.error("IPMI tools are not available on this system. Please ensure `ipmitool` is installed and available in the current directory or PATH.");
      return;
    }

    const db = await openOrCreateDatabase();
    if (!(await checkAndRefreshToken(db))) return;

    let server = flags.server || await promptly.prompt("Enter the server to test the IPMI credentials for: ");
    server = server.trim();

    const ipmiResult = await runIpmiCommand(server, "mc info");

    if (ipmiResult) {
      console.log(ipmiResult);
    }

    await closeDb(db);
  }
}
