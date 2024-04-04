const util = require("node:util");
const { exec } = require("node:child_process");
const execPromise = util.promisify(exec);
const keytar = require('keytar');
const { auth } = require("../firebase/firebase-config.ts");
const { closeDb, getCredential, getServer, openOrCreateDatabase } = require("../db/index.ts");
const needle = require('needle');

async function ipmiAvailable() {
  // Check if `ipmitool` is installed in path / current directory
  try {
    await execPromise("ipmitool -h")
    return true;
  } catch {
    try {
      await execPromise("./ipmitool -h");
      return true;
    } catch {
      return false;
    }
  }
}

async function updateCommandStatus(command: any, status: string) {
  if (!auth.currentUser) {
    return;
  }

  const sqliteDB = await openOrCreateDatabase();
  const authToken = await auth.currentUser.getIdToken();

  // Copy command object, remove id, update status
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updatedCommand = (({ id, ...o }) => o)(command)
  updatedCommand.status = status;

  await needle('put', `https://rmagent.firebaseio.com/users/${auth.currentUser.uid}/commands/${command.id}.json?auth=${authToken}`,
  updatedCommand, 
  { json: true });

  await closeDb(sqliteDB);
}

async function runIpmiCommand(server: string, command: string) {
  const sqliteDB = await openOrCreateDatabase();

  // Get server details from database
  const serverObject = await getServer(sqliteDB, server);

  if (!serverObject) {
    console.error("Server not found.");
    return;
  }

  // Get IPMI credentials from database
  const credential = await getCredential(sqliteDB, serverObject.id);

  if (!credential) {
    console.error("IPMI credentials not found for server", serverObject.server);
    return;
  }

  // Get IPMI password from keychain
  const password = await keytar.getPassword("rackmanage", credential.credential);

  // Execute IPMI command
  try {
    const { stderr, stdout } = await execPromise(`ipmitool -H ${credential.address} -U ${credential.username} -P ${password} -p ${credential.port} ${credential.flags} ${command}`);
    console.error(stderr);
    console.log(`${command} command sent to`, serverObject.server);

    return stdout;
  } catch (error) {
    throw new Error(`Error sending ${command} command to ${serverObject.server}: ${error}`);
  }
}

async function processIpmiCommands(commands: any) {
  console.log("Processing commands...");
  await Promise.all(commands.map(async (command: any) => {
    if (command.action === "chassis identify" && command.server) {
      // Execute IPMI command
      try {
        console.log(await runIpmiCommand(command.server, command.action));

        // Update command status
        await updateCommandStatus(command, "complete");
      } catch (error) {
        console.error("Error sending chassis identify command to", command.server, error);
      }
    }
  }));
}

export {
  ipmiAvailable,
  processIpmiCommands,
  runIpmiCommand,
};