import {Command, Flags} from '@oclif/core'

import { closeDb, openOrCreateDatabase } from '../db'
import { checkAndRefreshToken } from '../firebase/auth'
import { startMonitoring } from '../monitor'

export default class StartMonitoring extends Command {
  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    path: Flags.string({char: 'p', description: 'Path to database file'}),
  }

  static hidden = true;

  public async run(): Promise<void> {
    const {flags} = await this.parse(StartMonitoring)
    const db = await openOrCreateDatabase((flags && flags.path) || undefined);
    if (!(await checkAndRefreshToken(db))) return;

    startMonitoring();
  
    await closeDb(db, (flags && flags.path) || undefined);
  }
}
