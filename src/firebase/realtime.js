const { getConfigData, openOrCreateDatabase } = require("../db");
const { auth } = require("./firebaseConfig");
const needle = require('needle');

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

  sqliteDB.close();
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

  sqliteDB.close();
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

  sqliteDB.close();
}

module.exports = {
  initAgent,
  deleteAgent,
  updateStatus,
};