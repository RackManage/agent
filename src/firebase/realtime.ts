const { closeDb, getConfigData, openOrCreateDatabase } = require("../db/index.ts");
const { auth, db } = require("./firebase-config.ts");
const needle = require('needle');
const { onValue, ref } = require("firebase/database");
const { processIpmiCommands } = require("../ipmi/index.ts");

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
    clientId,
    lastConnected: Date.now(),
    teamId,
    version: "0.0.1",
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

async function updateStatus(status: any) {
  if (!auth.currentUser) {
    return;
  }

  const sqliteDB = await openOrCreateDatabase();
  const clientId = await getConfigData(sqliteDB, "clientId");
  const authToken = await auth.currentUser.getIdToken();

  await needle('put', `https://rmagent.firebaseio.com/users/${auth.currentUser.uid}/monitor/${status.id}.json?auth=${authToken}`,
  {
    clientId,
    date: Date.now(),
    mode: status.mode,
    name: status.name,
    port: status.port,
    server: status.server,
    status: status.status,
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

  const ipmiCommands: any[] = [];

  onValue(commandRef, (snapshot: any) => {
    const data = snapshot.val();
    if (data && Array.isArray(data) && data.length > 0) {
      for (const command of data) {
        if (command && command.status === "new" && command.type === "ipmi" && command.clientId === clientId) {
          ipmiCommands.push({
            id: data.indexOf(command),
            ...command,
          })
        }
      }

      if (ipmiCommands.length > 0) {
        processIpmiCommands(ipmiCommands);
      }
    }
  });

  await closeDb(sqliteDB);
}

export {
  deleteAgent,
  initAgent,
  subscribeToCommands,
  updateStatus,
};