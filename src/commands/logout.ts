import {Command} from '@oclif/core'
const { closeDb, openOrCreateDatabase } = require('../db/index.ts')
const { checkAndRefreshToken, logout } = require('../firebase/auth.ts')

export default class Logout extends Command {
  static description = 'Disconnect agent from Rack Manage account'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    const db = await openOrCreateDatabase();
    if (!(await checkAndRefreshToken(db))) return;

    await logout();

    await closeDb(db);
  }
}
