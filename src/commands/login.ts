import {Args, Command, Flags} from '@oclif/core'
import { hostname } from 'node:os'
import { prompt } from 'promptly'

import { closeDb, openOrCreateDatabase } from '../db'
import { loginWithToken } from '../firebase/auth'
import { initAgent } from '../firebase/realtime'

export default class Login extends Command {
  static args = {
    token: Args.string({description: 'Enrollment token'}),
  }
  static description = 'Connect agent to Rack Manage account'
  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> abc123',
    '<%= config.bin %> <%= command.id %> --broker-url https://api.rackmanage.io',
  ]
  static flags = {
    'broker-url': Flags.string({description: 'Broker base URL'}),
    name: Flags.string({description: 'Friendly device name'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Login)
    let enrollmentValue = args.token || await prompt('Enter enrollment token: ')
    enrollmentValue = enrollmentValue.trim()

    const brokerUrl = (flags["broker-url"] || 'https://api.rackmanage.io').trim()
    const deviceName = (flags.name || hostname()).trim()

    const db = await openOrCreateDatabase();
    const loginSuccess = await loginWithToken(enrollmentValue.trim(), db, {
      brokerUrl,
      deviceName,
    });

    if (!loginSuccess) {
      await closeDb(db);
      console.error("Error logging in. Please check the enrollment details and try again.");
      return;
    }

    console.log('\nSuccessfully logged in to Rack Manage');

    await initAgent();
    await closeDb(db);
  }
}
