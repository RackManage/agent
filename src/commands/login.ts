import {Args, Command} from '@oclif/core'
import { prompt } from 'promptly'
const { closeDb, openOrCreateDatabase } = require('../db/index.ts')
const { loginWithToken } = require('../firebase/auth.ts')

export default class Login extends Command {
  static args = {
    token: Args.string({description: 'Agent token'}),
  }

  static description = 'Connect agent to Rack Manage account'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    const {args} = await this.parse(Login)
    let token = args.token || await prompt('Enter agent token: ')
    token = token.trim()

    console.log("\n");

    const db = await openOrCreateDatabase();
    const loginSuccess = await loginWithToken(token, db);

    if (!loginSuccess) {
      console.error("Error logging in. Please check your token and try again.");
      return;
    }

    await closeDb(db);
  }
}
