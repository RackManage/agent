import {Command, Flags} from '@oclif/core'
const { addCredentials, closeDb, getServer, openOrCreateDatabase } = require('../../db/index.ts')
const { checkAndRefreshToken } = require('../../firebase/auth.ts')
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
  let credential : any = {};

  if (flags.port && !isValidNumber(flags.port)) {
    flags.port = undefined;
  }

  const ipmiAddress = flags.address || await promptly.prompt("IPMI address: ");
  const ipmiUsername = flags.username || await promptly.prompt("IPMI username: ");
  const ipmiPassword = flags.password || await promptly.password("IPMI password: ");
  const ipmiPort = flags.port || await promptly.prompt("IPMI port [623]: ", { default: "623", validator: (value: any) => numberValidator(value, 1, 65_535) });
  const ipmiFlags = flags.flags || await promptly.prompt("Extra ipmitool flags (optional): ", { default: "", retry: false });

  credential = {
    address: ipmiAddress,
    flags: ipmiFlags,
    password: ipmiPassword,
    port: ipmiPort,
    username: ipmiUsername,
  };

  return credential;

}

export default class Set extends Command {
  static description = 'Set IPMI credentials for a server'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    address: Flags.string({char: 'a', description: 'IPMI address'}),
    flags: Flags.string({char: 'f', description: 'Extra ipmitool flags'}),
    password: Flags.string({char: 'p', description: 'IPMI password'}),
    port: Flags.integer({char: 'p', description: 'Port to monitor'}),
    server: Flags.string({char: 's', description: 'Server address'}),
    username: Flags.string({char: 'u', description: 'IPMI username'}),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Set)
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

    const credential = await setIpmi(flags);
    credential.serverId = serverData.id;

    await addCredentials(db, credential);
    await closeDb(db);

    console.log(`IPMI credentials added / updated for server ${server}`);
  }
}
