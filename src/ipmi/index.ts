const { exec } = require("node:child_process");
const { promisify } = require("node:util");
const execPromise = promisify(exec);

import { closeDb, getCredential, getServer, openOrCreateDatabase } from "../db";
import { ensureFirebaseSession } from "../firebase/auth";
import { auth } from "../firebase/firebase-config";
import { commandPath, getRealtimeContext } from "../firebase/paths";
import { firebaseJsonRequest } from "../firebase/rest";

function getKeytar() {
  return require("keytar");
}

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
  const sqliteDB = await openOrCreateDatabase();

  try {
    if (!(await ensureFirebaseSession(sqliteDB, false)) || !auth.currentUser) {
      return;
    }

    const context = await getRealtimeContext(sqliteDB);
    const authToken = await auth.currentUser.getIdToken();

    // Copy command object, remove id, update status
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updatedCommand = (({ id, ...o }) => o)(command)
    updatedCommand.status = status;

    await firebaseJsonRequest(
      "PUT",
      commandPath(context, `${command.id}`),
      authToken,
      updatedCommand
    );
  } finally {
    await closeDb(sqliteDB);
  }
}

async function runIpmiCommand(server: string, command: string) {
  const sqliteDB = await openOrCreateDatabase();

  try {
    // Get server details from database
    const serverObject: any = await getServer(sqliteDB, server);

    if (!serverObject) {
      console.error("Server not found.");
      return;
    }

    // Get IPMI credentials from database
    const credential: any = await getCredential(sqliteDB, serverObject.id);

    if (!credential) {
      console.error("IPMI credentials not found for server", serverObject.server);
      return;
    }

    // Get IPMI password from keychain
    const keytar = getKeytar();
    const password = await keytar.getPassword("rackmanage", credential.credential);

    // Execute IPMI command
    try {
      const { stderr, stdout } = await execPromise(`ipmitool -H ${credential.address} -U ${credential.username} -P ${password} -p ${credential.port} ${credential.flags} ${command}`);
      console.error(stderr);
      console.log(`${command} command sent to`, serverObject.server);

      return stdout;
    } catch (error: any) {
      // Hide password in error message
      error.message = error.message.replace(`-P ${password}`, "-P ********")
      throw new Error(`Error sending ${command} command to ${serverObject.server}: ${error.message}`);
    }
  } finally {
    await closeDb(sqliteDB);
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
      } catch {
        console.error("Error sending chassis identify command to", command.server);
        await updateCommandStatus(command, "error");
      }
    }
  }));
}

export {
  ipmiAvailable,
  processIpmiCommands,
  runIpmiCommand,
};
