import {Command} from '@oclif/core'
const { closeDb, getConfigData, openOrCreateDatabase } = require('../db/index.ts')
const { checkAndRefreshToken } = require('../firebase/auth.ts')
const Table = require('cli-table');
const packageVersion = require('../../package.json').version;

export default class Status extends Command {
  static description = 'Check the status of the agent'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    const db = await openOrCreateDatabase();
    await checkAndRefreshToken(db, false);

    const data: any = {
      clientId: undefined,
      email: undefined,
      loggedIn: "False",
      teamId: undefined,
      
    };

    const token = await getConfigData(db, "refreshToken");
    if (token) {
      data.loggedIn = "True";
    }

    data.email = await getConfigData(db, "email");
    data.teamId = await getConfigData(db, "teamId");
    data.clientId = await getConfigData(db, "clientId");

    const keys = Object.keys(data);

    for (const key of keys) {
      if (!data[key]) {
        data[key] = "Not set";
      }
    }

    const table = new Table({
      head: [
        "Logged In",
        "Email",
        "Team ID",
        "Client ID",
        "Agent Version",
        "Agent Status",
      ],
    });
    table.push([
      data.loggedIn,
      data.email,
      data.teamId,
      data.clientId,
      packageVersion,
      "Stopped",
    ]);

    console.log(table.toString());

    await closeDb(db);
  }
}
