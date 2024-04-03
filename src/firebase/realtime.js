const { getConfigData, openOrCreateDatabase, closeDb } = require("../db");
const { auth, db } = require("./firebaseConfig");
const needle = require('needle');
const { onValue, ref } = require("firebase/database");
const { processIpmiCommands } = require("../ipmi");

async function initAgent() {
  if (!auth.currentUser) {
    return;
  }

  const sqliteDB = await openOrCreateDatabase();
  const teamId = await getConfigData(sqliteDB, "teamId");
  const clientId = await getConfigData(sqliteDB, "clientId");
  const authToken = await auth.currentUser.getIdToken();

  needle('put', `https://rmagent.firebaseio.com/users/${auth.currentUser.uid}/agents/${clientId}.json?auth=${authToken}`,
  {
    lastConnected: Date.now(),
    version: "0.0.1",
    clientId: clientId,
    teamId: teamId,
  }, 
  { json: true });

  await closeDb(sqliteDB);
}

async function deleteAgent() {
  if (!auth.currentUser) {
    console.log("Not logged in")
    return;
  }

  const sqliteDB = await openOrCreateDatabase();
  const clientId = await getConfigData(sqliteDB, "clientId");
  const authToken = await auth.currentUser.getIdToken();

  await needle('delete', `https://rmagent.firebaseio.com/users/${auth.currentUser.uid}/agents/${clientId}.json?auth=${authToken}`);

  await closeDb(sqliteDB);
}

async function updateStatus(status) {
  if (!auth.currentUser) {
    return;
  }

  const sqliteDB = await openOrCreateDatabase();
  const clientId = await getConfigData(sqliteDB, "clientId");
  const authToken = await auth.currentUser.getIdToken();

  await needle('put', `https://rmagent.firebaseio.com/users/${auth.currentUser.uid}/monitor/${status.id}.json?auth=${authToken}`,
  {
    name: status.name,
    clientId: clientId,
    server: status.server,
    port: status.port,
    mode: status.mode,
    status: status.status,
    date: Date.now(),
  }, 
  { json: true });

  await closeDb(sqliteDB);
}

async function subscribeToCommands() {
  if (!auth.currentUser) {
    return;
  }

  const sqliteDB = await openOrCreateDatabase();
  const clientId = await getConfigData(sqliteDB, "clientId");
  const commandRef = ref(db, `users/${auth.currentUser.uid}/commands`);

  console.log("Subscribed to commands");

  let ipmiCommands = [];

  onValue(commandRef, (snapshot) => {
    const data = snapshot.val();
    if (data && Array.isArray(data) && data.length > 0) {
      data.forEach((command) => {
        if (command && command.status === "new" && command.type == "ipmi" && command.clientId === clientId) {
          ipmiCommands.push({
            id: data.indexOf(command),
            ...command,
          })
        }
      });

      if (ipmiCommands.length > 0) {
        processIpmiCommands(ipmiCommands);
      }
    }
  });

  await closeDb(sqliteDB);
}

module.exports = {
  initAgent,
  deleteAgent,
  updateStatus,
  subscribeToCommands,
};