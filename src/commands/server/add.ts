import {Command, Flags} from '@oclif/core'
const { addCredentials, addServer, closeDb, openOrCreateDatabase } = require('../../db/index.ts')
const { checkAndRefreshToken } = require('../../firebase/auth.ts')
const crypto = require("node:crypto");
const promptly = require("promptly");
const { ipmiAvailable } = require("../../ipmi/index.ts");

// Validates if a value is a number within a specified range
function numberValidator(value: any, min: number, max: number) {
  const number = Number.parseInt(value, 10);

  if (!Number.isNaN(number) && number >= min && number <= max) {
    return value;
  }
  
  throw new Error(`Value must be a number between ${min} and ${max}`);
}

function isValidNumber(value: number) {
  try {
    numberValidator(value, 0, 65_535);
    return true;
  } catch {
    return false;
  }
}

async function setIpmi(flags: any) {
  let setIpmi = await promptly.confirm("Do you want to configure IPMI credentials for this server? [y/N]: ", { default: "n" });

  if (!await ipmiAvailable()) {
    console.error("IPMI tools are not available on this system. Please ensure `ipmitool` is installed and available in the current directory or PATH.");
    setIpmi = false;
  }

  let credential : any = {};
  
  if (setIpmi) {
    if (flags.ipmiPort && !isValidNumber(flags.ipmiPort)) {
      flags.ipmiPort = undefined;
    }

    const ipmiAddress = flags.ipmiAddress || await promptly.prompt("IPMI address: ");
    const ipmiUsername = flags.ipmiUsername || await promptly.prompt("IPMI username: ");
    const ipmiPassword = flags.ipmiPassword || await promptly.password("IPMI password: ");
    const ipmiPort = flags.ipmiPort || await promptly.prompt("IPMI port [623]: ", { default: "623", validator: (value: any) => numberValidator(value, 1, 65_535) });
    const ipmiFlags = flags.ipmiFlags || await promptly.prompt("Extra ipmitool flags (optional): ", { default: "", retry: false });

    credential = {
      address: ipmiAddress,
      flags: ipmiFlags,
      password: ipmiPassword,
      port: ipmiPort,
      username: ipmiUsername,
    };

    return credential;
  }
  
  return false;
}

export default class Add extends Command {
  static description = 'Add a server'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    interval: Flags.integer({char: 'i', description: 'Interval in minutes'}),
    ipmiAddress: Flags.string({char: 'a', description: 'IPMI address'}),
    ipmiFlags: Flags.string({char: 'f', description: 'Extra ipmitool flags'}),
    ipmiPassword: Flags.string({char: 'P', description: 'IPMI password'}),
    ipmiPort: Flags.integer({char: 'o', description: 'IPMI port'}),
    ipmiUsername: Flags.string({char: 'u', description: 'IPMI username'}),
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

    if (flags.port && !isValidNumber(flags.port)) {
      flags.port = undefined;
    }

    // Ask for address first
    const server = flags.server || await promptly.prompt("Server address: ");
    const name = flags.name || await promptly.prompt("Server name (optional): ", { default: "", retry: false});
    const mode = flags.mode || await promptly.choose('Monitoring mode (tcp, udp, http, or https) [tcp]: ', ['http', 'https', 'tcp', 'udp'], { default: 'tcp' });
    const defaultPort = mode === "http" || mode === "https" ? "80" : "0";
    const port = flags.port || await promptly.prompt(`Port to monitor [${defaultPort}]: `, { default: defaultPort, validator: (value: any) => numberValidator(value, 0, 65_535) });

    const data = {
      id: serverId,
      interval: flags.interval || await promptly.prompt("Interval in minutes [5]: ", {default: "5"}),
      mode,
      name,
      port,
      server,
    };

    const credential = await setIpmi(flags);

    await addServer(db, data);

    if (credential) {
      await addCredentials(db, {
        address: credential.address,
        flags: credential.flags,
        password: credential.password,
        port: credential.port,
        serverId,
        username: credential.username,
      });
    }

    await closeDb(db);

    console.log(`Server ${data.server} added with id ${serverId}`);
  }
}
