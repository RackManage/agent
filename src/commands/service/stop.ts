import {Command} from '@oclif/core'

import { closeDb, openOrCreateDatabase } from '../../db'
import { checkAndRefreshToken } from '../../firebase/auth'
import { manageService } from '../../service'

export default class Stop extends Command {
  static description = 'Stop the agent service'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    const db = await openOrCreateDatabase();
    if (!(await checkAndRefreshToken(db))) return;
    await closeDb(db);

    await manageService("stop");
  }
}
