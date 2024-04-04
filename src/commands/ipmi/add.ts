import {Command, Flags} from '@oclif/core'
const { addCredentials, closeDb, getServer, openOrCreateDatabase } = require('../../db/index.ts')
const { checkAndRefreshToken } = require('../../firebase/auth.ts')
const crypto = require("node:crypto");
const promptly = require("promptly");
const { ipmiAvailable } = require("../../ipmi/index.ts");
const keytar = require("keytar");

export default class Add extends Command {
  static description = 'Add IPMI credentials for a server'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    address: Flags.string({char: 'a', description: 'IPMI address'}),
    password: Flags.string({char: 'p', description: 'IPMI password'}),
    port: Flags.integer({char: 'p', description: 'Port to monitor'}),
    server: Flags.string({char: 's', description: 'Server address'}),
    username: Flags.string({char: 'u', description: 'IPMI username'}),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Add)

    if (! await ipmiAvailable()) {
      console.error("IPMI tools are not available on this system. Please ensure `ipmitool` is installed and available in the current directory or PATH.");
      return;
    }

    const db = await openOrCreateDatabase();
    if (!(await checkAndRefreshToken(db))) return;

    const server = flags.server || await promptly.prompt("Enter the server to set the IPMI credentials for: ");

    const serverData: any = await getServer(db, server);

    if (!serverData) {
      console.error(`Server ${server} not found`);
      await closeDb(db);
      return;
    }

    const ipmiAddress = flags.address || await promptly.prompt("IPMI address: ");
    const ipmiUsername = flags.username || await promptly.prompt("IPMI username: ");
    const ipmiPassword = flags.password || await promptly.prompt("IPMI password: ");

    console.log("\n");

    const accountId = "rackmanage_" + crypto.randomUUID();
    await keytar.setPassword("rackmanage", accountId, ipmiPassword);

    const ipmiData = {
      address: ipmiAddress,
      credential: accountId,
      server: serverData.id,
      username: ipmiUsername,
      
    };
  
    await addCredentials(db, ipmiData);

    await closeDb(db);

    console.log(`IPMI credentials added for server ${server}`);
  }
}
