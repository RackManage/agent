import {Args, Command, Flags} from '@oclif/core'
import { hostname } from 'node:os'
import { prompt } from 'promptly'

import { closeDb, openOrCreateDatabase } from '../db'
import { loginWithToken } from '../firebase/auth'
import { initAgent } from '../firebase/realtime'

function parseEnrollmentValue(rawValue: string) {
  try {
    const url = new URL(rawValue);
    const enrollmentToken =
      url.searchParams.get("token") ||
      url.searchParams.get("enrollmentToken");

    if (!enrollmentToken) {
      return {
        brokerUrl: null,
        enrollmentToken: rawValue,
      };
    }

    const brokerUrl =
      url.searchParams.get("brokerUrl") ||
      url.searchParams.get("broker") ||
      (url.protocol.startsWith("http") ? `${url.origin}${url.pathname}` : null);

    return {
      brokerUrl,
      enrollmentToken,
    };
  } catch {
    return {
      brokerUrl: null,
      enrollmentToken: rawValue,
    };
  }
}

export default class Login extends Command {
  static args = {
    token: Args.string({description: 'Enrollment token or enrollment URL'}),
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
    let enrollmentValue = args.token || await prompt('Enter enrollment token or enrollment URL: ')
    enrollmentValue = enrollmentValue.trim()

    const parsed = parseEnrollmentValue(enrollmentValue)
    const brokerUrl = (flags["broker-url"] || parsed.brokerUrl || 'https://api.rackmanage.io').trim()
    const deviceName = (flags.name || hostname()).trim()

    const db = await openOrCreateDatabase();
    const loginSuccess = await loginWithToken(parsed.enrollmentToken.trim(), db, {
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
