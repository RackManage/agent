import {Command} from '@oclif/core'
const { closeDb, openOrCreateDatabase } = require('../../db/index.ts')
const { checkAndRefreshToken } = require('../../firebase/auth.ts')
const { manageService } = require("../../service/index.ts");

export default class Uninstall extends Command {
  static description = 'Uninstalls the agent service'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    const db = await openOrCreateDatabase();
    if (!(await checkAndRefreshToken(db))) return;
    await closeDb(db);

    await manageService("uninstall");
  }
}
