import {Command} from '@oclif/core'
const Table = require('cli-table');

import { closeDb, getConfigData, openOrCreateDatabase } from '../db'
import { checkAndRefreshToken } from '../firebase/auth'
const packageVersion = require('../../package.json').version;

export default class Status extends Command {
  static description = 'Check the status of the agent'
  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    const db = await openOrCreateDatabase();
    const loggedIn = await checkAndRefreshToken(db, false);

    const data: any = {
      clientId: await getConfigData(db, "clientId"),
      deviceName: await getConfigData(db, "deviceName"),
      loggedIn: loggedIn ? "True" : "False",
      workspaceId: (await getConfigData(db, "workspaceId")) || (await getConfigData(db, "teamId")),
      workspaceType: (await getConfigData(db, "workspaceType")) || ((await getConfigData(db, "teamId")) ? "team" : null),
    };

    const keys = Object.keys(data);

    for (const key of keys) {
      if (!data[key]) {
        data[key] = "Not set";
      }
    }

    const table = new Table({
      head: [
        "Logged In",
        "Workspace Type",
        "Workspace ID",
        "Device ID",
        "Device Name",
        "Agent Version",
        "Agent Status",
      ],
    });
    table.push([
      data.loggedIn,
      data.workspaceType,
      data.workspaceId,
      data.clientId,
      data.deviceName,
      packageVersion,
      "Stopped",
    ]);

    console.log(table.toString());

    await closeDb(db);
  }
}
