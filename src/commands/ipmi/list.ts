import {Command} from '@oclif/core'
const Table = require("cli-table3");

import { closeDb, getCredentials, getServers, openOrCreateDatabase } from '../../db/index'
import { checkAndRefreshToken } from '../../firebase/auth'

export default class List extends Command {
  static description = 'List IPMI accounts'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    const db = await openOrCreateDatabase();
    if (!(await checkAndRefreshToken(db))) return;

    const credentials: any = await getCredentials(db);
    
    if (credentials.length === 0) {
      console.log("No IPMI credentials found. Use `rmagent ipmi set` to add IPMI accounts.");
      await closeDb(db);
      return;
    }

    const table = new Table({
      head: ["Server Address", "Server Name", "IPMI Address", "Port", "Flags", "Username"],
    });

    const servers: any = await getServers(db);

    for (const credential of credentials) {
      const server = servers.find((s: any) => s.id === credential.server_id);

      table.push([
        server.server,
        server.name || "N/A",
        credential.address,
        credential.port,
        credential.flags || "None",
        credential.username,
      ]);
    }

    console.log(table.toString());

    await closeDb(db);
  }
}
