const util = require("util");
const { exec } = require("child_process");
const execPromise = util.promisify(exec);
const keytar = require('keytar');
const { auth } = require("../firebase/firebaseConfig");
const { getServer, getCredential, openOrCreateDatabase, closeDb } = require("../db");
const needle = require('needle');

async function ipmiAvailable() {
  // Check if `ipmitool` is installed in path / current directory
  try {
    await execPromise("ipmitool -h")
    return true;
  } catch (error) {
    try {
      await execPromise("./ipmitool -h");
      return true;
    } catch (error) {
      return false;
    }
  }
}

async function updateCommandStatus(command, status) {
  if (!auth.currentUser) {
    return;
  }

  const sqliteDB = await openOrCreateDatabase();
  const authToken = await auth.currentUser.getIdToken();

  // Copy command object, remove id, update status
  let updatedCommand = (({ id, ...o }) => o)(command)
  updatedCommand.status = status;

  await needle('put', `https://rmagent.firebaseio.com/users/${auth.currentUser.uid}/commands/${command.id}.json?auth=${authToken}`,
  updatedCommand, 
  { json: true });

  await closeDb(sqliteDB);
}

async function processIpmiCommands(commands) {
  console.log("Processing commands...");
  const sqliteDB = await openOrCreateDatabase();

  for (let command of commands) {
    if (command.action == "chassis identify" && command.server) {
      // Get server details from database
      let server = await getServer(sqliteDB, command.server);

      if (!server) {
        console.error("Server not found.");
        continue;
      }

      // Get IPMI credentials from database
      let credential = await getCredential(sqliteDB, server.id);

      if (!credential) {
        console.error("IPMI credentials not found for server", server.server);
        continue;
      }

      // Get IPMI password from keychain
      let password = await keytar.getPassword("rackmanage", credential.credential);

      // Execute IPMI command
      try {
        let { stdout, stderr } = await execPromise(`ipmitool -H ${credential.address} -U ${credential.username} -P ${password} chassis identify`);
        console.error(stderr);
        console.log(stdout);
        console.log("Chassis identify command sent to", server.server);

        // Update command status
        await updateCommandStatus(command, "complete");
      } catch (error) {
        console.error("Error sending chassis identify command to", server.server, error);
      }
    }
  }

  await closeDb(sqliteDB);
}

module.exports = {
  ipmiAvailable,
  processIpmiCommands,
};