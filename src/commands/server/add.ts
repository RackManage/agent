import {Command, Flags} from '@oclif/core'
const { addServer, closeDb, openOrCreateDatabase } = require('../../db/index.ts')
const { checkAndRefreshToken } = require('../../firebase/auth.ts')
const crypto = require("node:crypto");
const promptly = require("promptly");

export default class Add extends Command {
  static description = 'Add a server'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    interval: Flags.integer({char: 'i', description: 'Interval in minutes'}),
    mode: Flags.string({char: 'm', description: 'Monitoring mode (tcp, udp, http, https)'}),
    name: Flags.string({char: 'n', description: 'Name of the server'}),
    port: Flags.integer({char: 'p', description: 'Port to monitor'}),
    server: Flags.string({char: 's', description: 'Server address'}),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Add)
    const db = await openOrCreateDatabase();
    if (!(await checkAndRefreshToken(db))) return;

    const serverId = crypto.randomUUID();

    const data = {
      id: serverId,
      interval: flags.interval || await promptly.prompt("Interval in minutes [5]: ", {default: "5"}),
      mode: flags.mode || await promptly.prompt("Monitoring mode (tcp, udp, http, https) [tcp]: ", {default: "tcp"}),
      name: flags.name || await promptly.prompt("Name: ", {default: ""}),
      port: flags.port || await promptly.prompt("Port to monitor [0]: ", {default: "0"}),
      server: flags.server || await promptly.prompt("Server address: "),
    };

    await addServer(db, data);

    await closeDb(db);

    console.log(`Server ${data.name} added with id ${serverId}`);
  }
}
