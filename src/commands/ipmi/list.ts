import {Command} from '@oclif/core'
const { closeDb, getCredentials, getServers, openOrCreateDatabase } = require('../../db/index.ts')
const { checkAndRefreshToken } = require('../../firebase/auth.ts')
const Table = require("cli-table3");

export default class List extends Command {
  static description = 'List all servers'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    const db = await openOrCreateDatabase();
    if (!(await checkAndRefreshToken(db))) return;

    const credentials = await getCredentials(db);
    
    if (credentials.length === 0) {
      console.log("No IPMI credentials found. Use `rmagent ipmi set` to add IPMI accounts.");
      await closeDb(db);
      return;
    }

    const table = new Table({
      head: ["Server Address", "Server Name", "IPMI Address", "Port", "Flags", "Username"],
    });

    const servers = await getServers(db);

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
