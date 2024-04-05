import {Command} from '@oclif/core'
const Table = require("cli-table3");

import { closeDb, getCredential, getServers, openOrCreateDatabase } from '../../db/index'
import { checkAndRefreshToken } from '../../firebase/auth'

export default class List extends Command {
  static description = 'List all servers'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    const db = await openOrCreateDatabase();
    if (!(await checkAndRefreshToken(db))) return;

    const servers: any = await getServers(db);
    
    if (servers.length === 0) {
      console.log("No servers found. Use `rmagent server add` to add a server.");
      await closeDb(db);
      return;
    }

    const table = new Table({
      head: ["Server", "Name", "Interval", "Port", "Mode", "IPMI"],
    });

    const ipmi = await Promise.all(servers.map(async (server: any) => {
      const credential = await getCredential(db, server.id);
      return {
        enabled: Boolean(credential),
        server: server.id,
      }
    }));

    for (const server of servers) {
      const serverIpmi = ipmi.find((i) => i.server === server.id);

      table.push([
        server.server,
        server.name || "N/A",
        server.interval,
        server.port,
        server.mode,
        serverIpmi.enabled ? "Enabled" : "Disabled",
      ]);
    }

    console.log(table.toString());

    await closeDb(db);
  }
}
