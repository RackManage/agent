import {Command, Flags} from '@oclif/core'
const { closeDb, openOrCreateDatabase } = require('../db/index.ts')
const { checkAndRefreshToken } = require('../firebase/auth.ts')

export default class StartAgent extends Command {
  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    path: Flags.string({char: 'p', description: 'Path to database file'}),
  }

  static hidden = true;

  public async run(): Promise<void> {
    const {flags} = await this.parse(StartAgent)
    const db = await openOrCreateDatabase((flags && flags.path) || undefined);
    if (!(await checkAndRefreshToken(db))) return;
  
    const { startAgent } = require("../background/index.ts");
    startAgent();
  
    await closeDb(db, (flags && flags.path) || undefined);
  }
}
