import {Command} from '@oclif/core'

import { closeDb, openOrCreateDatabase } from '../db'
import { checkAndRefreshToken, logout } from '../firebase/auth'
import { deleteAgent } from '../firebase/realtime'

export default class Logout extends Command {
  static description = 'Disconnect this device from Rack Manage'
  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    await this.parse(Logout)

    const db = await openOrCreateDatabase();
    if (await checkAndRefreshToken(db, false)) {
      await deleteAgent();
    }

    await logout(db);
    await closeDb(db);
  }
}
