const { onValue, ref } = require("firebase/database");

import { closeDb, openOrCreateDatabase } from "../db"
import { processIpmiCommands } from "../ipmi"
import { ensureFirebaseSession } from "./auth"
import { auth, db } from "./firebase-config"
import { agentPresencePath, commandsPath, getRealtimeContext, monitorPath } from "./paths"
import { firebaseJsonRequest } from "./rest"

async function initAgent() {
  const sqliteDB = await openOrCreateDatabase();

  try {
    if (!(await ensureFirebaseSession(sqliteDB, false)) || !auth.currentUser) {
      return;
    }

    const context = await getRealtimeContext(sqliteDB);
    const authToken = await auth.currentUser.getIdToken();

    await firebaseJsonRequest("PUT", agentPresencePath(context), authToken, {
      agentUid: context.agentUid,
      clientId: context.clientId,
      lastConnected: Date.now(),
      version: require("../../package.json").version,
      workspaceId: context.workspaceId,
      workspaceType: context.workspaceType,
    });
  } finally {
    await closeDb(sqliteDB);
  }
}

async function deleteAgent() {
  const sqliteDB = await openOrCreateDatabase();

  try {
    if (!(await ensureFirebaseSession(sqliteDB, false)) || !auth.currentUser) {
      return;
    }

    const context = await getRealtimeContext(sqliteDB);
    const authToken = await auth.currentUser.getIdToken();
    await firebaseJsonRequest("DELETE", agentPresencePath(context), authToken);
  } finally {
    await closeDb(sqliteDB);
  }
}

async function updateStatus(status: any) {
  const sqliteDB = await openOrCreateDatabase();

  try {
    if (!(await ensureFirebaseSession(sqliteDB, false)) || !auth.currentUser) {
      return;
    }

    const context = await getRealtimeContext(sqliteDB);
    const authToken = await auth.currentUser.getIdToken();
    await firebaseJsonRequest("PUT", monitorPath(context, status.id), authToken, {
      agentUid: context.agentUid,
      clientId: context.clientId,
      date: Date.now(),
      mode: status.mode,
      name: status.name,
      port: status.port,
      server: status.server,
      status: status.status,
      workspaceId: context.workspaceId,
      workspaceType: context.workspaceType,
    });
  } finally {
    await closeDb(sqliteDB);
  }
}

function normalizeCommands(data: any) {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data.flatMap((command, index) => {
      if (!command) {
        return [];
      }

      return [{
        id: `${index}`,
        ...command,
      }];
    });
  }

  return Object.entries(data).flatMap(([id, command]) => {
    if (!command || typeof command !== "object") {
      return [];
    }

    return [{
      id,
      ...(command as object),
    }];
  });
}

async function subscribeToCommands() {
  const sqliteDB = await openOrCreateDatabase();

  try {
    if (!(await ensureFirebaseSession(sqliteDB, false)) || !auth.currentUser) {
      return;
    }

    const context = await getRealtimeContext(sqliteDB);
    const commandRef = ref(db, commandsPath(context));
    const inFlightCommandIds = new Set<string>();

    console.log("Subscribed to commands");

    onValue(commandRef, async (snapshot: any) => {
      const commands = normalizeCommands(snapshot.val())
        .filter((command: any) => (
          command.status === "new" &&
          command.type === "ipmi" &&
          !inFlightCommandIds.has(command.id)
        ));

      if (commands.length === 0) {
        return;
      }

      for (const command of commands) {
        inFlightCommandIds.add(command.id);
      }

      try {
        await processIpmiCommands(commands);
      } finally {
        for (const command of commands) {
          inFlightCommandIds.delete(command.id);
        }
      }
    });
  } finally {
    await closeDb(sqliteDB);
  }
}

export {
  deleteAgent,
  initAgent,
  subscribeToCommands,
  updateStatus,
};
