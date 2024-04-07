import {Command} from '@oclif/core'

import { closeDb, openOrCreateDatabase } from '../db'
import { checkAndRefreshToken, logout } from '../firebase/auth'

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
