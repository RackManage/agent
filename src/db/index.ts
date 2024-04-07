const sqlite3 = require("sqlite3").verbose();
const fs = require("node:fs");
const fsPromises = fs.promises;
const os = require("node:os");
const path = require("node:path");
const { exit } = require("node:process");
const crypto = require("node:crypto");
const keytar = require("keytar");

import { getEffectiveUidGid, isAdmin } from '../service/helpers'
import { dataPath, dbName, findDatabasePath } from './paths'

function deleteWithRetry(filePath: string , maxRetries = 5, interval = 100, attempt = 0) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    if (attempt < maxRetries) {
      setTimeout(() => deleteWithRetry(filePath, maxRetries, interval, attempt + 1), interval);
    } else {
      console.error("Unable to delete file:", error);
    }
  }
}

function migrateDatabaseToUserLocation() {
  const { systemPath, userPath } = dataPath();

  // If the database is not in the user path then copy it there
  if (findDatabasePath() !== path.join(userPath, dbName) && fs.existsSync(path.join(systemPath, dbName))) {
    fs.copyFileSync(path.join(systemPath, dbName), path.join(userPath, dbName));

    // If file copied successfully then remove the original
    if (fs.existsSync(path.join(userPath, dbName))) {
      deleteWithRetry(path.join(systemPath, dbName));
    } else {
      console.error("Error migrating database. Please check permissions.");
    }
  }
}

function migrateDatabaseToSystemLocation() {
  const { systemPath, userPath } = dataPath();

  // If the database is not in the system path then copy it there
  if (findDatabasePath() !== path.join(systemPath, dbName) && fs.existsSync(path.join(userPath, dbName))) {
    fs.copyFileSync(path.join(userPath, dbName), path.join(systemPath, dbName));
    
    // If file copied successfully then remove the original
    if (fs.existsSync(path.join(systemPath, dbName))) {
      deleteWithRetry(path.join(userPath, dbName));
    } else {
      console.error("Error migrating database. Please check permissions.");
    }
  }
}

async function openOrCreateDatabase(dbPath = findDatabasePath()) {
  const { systemPath } = dataPath();
  if (dbPath.startsWith(systemPath)) {
    if (!(await isAdmin())) {
      console.error("Please run this command as root");
      exit(1);
    }
  } else if (await isAdmin()) {
    await chownDb(dbPath);
  }

  return new Promise((resolve, reject) => {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err: Error) => {
      if (err) {
        console.error("Could not open database", err);
        reject(err);
      } else {
        initializeDatabase(db).then(async () => resolve(db));
      }
    });
  });
}

async function chownDb(dbPath = findDatabasePath()) {
  if (os.platform() !== "linux" && os.platform() !== "darwin") {
    return;
  }

  const { userPath } = dataPath();
  const dir = path.dirname(dbPath);
  
  if (fs.existsSync(dir) && await isAdmin() && dbPath.startsWith(userPath)) {
    const { gid, uid } = await getEffectiveUidGid();
    await fsPromises.chown(dir, uid, gid);
  }

  if (fs.existsSync(dbPath) && await isAdmin() && dbPath.startsWith(userPath)) {
    const { gid, uid } = await getEffectiveUidGid();
    await fsPromises.chown(dbPath, uid, gid);
  }
}

async function closeDb(db: any, dbPath = findDatabasePath()) {
  await chownDb(dbPath);
  db.close();
}

function initializeDatabase(db: any) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
      )`, [], (err: Error) => {
        if (err) {
          console.error("Error creating config table", err);
          return reject(err);
        }
      });

      db.run(`CREATE TABLE IF NOT EXISTS servers (
        id TEXT PRIMARY KEY NOT NULL,
        server TEXT KEY NOT NULL,
        name TEXT,
        interval INTEGER DEFAULT 5 NOT NULL,
        port INTEGER,
        mode TEXT DEFAULT 'tcp' NOT NULL
      )`, [], (err: Error) => {
        if (err) {
          console.error("Error creating servers table", err);
          reject(err);
        } else {
          resolve(null);
        }
      });

      db.run(`CREATE TABLE IF NOT EXISTS ipmi (
        server_id TEXT PRIMARY KEY NOT NULL,
        address TEXT NOT NULL,
        username TEXT NOT NULL,
        credential TEXT NOT NULL,
        port INTEGER DEFAULT 623,
        flags TEXT DEFAULT '',
        FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
      )`, [], (err: Error) => {
        if (err) {
          console.error("Error creating ipmi table", err);
          reject(err);
        } else {
          resolve(null);
        }
      });

      db.run("PRAGMA foreign_keys = ON", (err: Error) => {
        if (err) {
          console.error("Error enabling foreign key support", err);
          reject(err);
        }
      });
    });
  });
}

function addServer(db: any, server: { id: string, interval: number,  mode: string, name: string, port: number, server: string }) {
  return new Promise((resolve, reject) => {
    db.run(`REPLACE INTO servers (id, server, name, interval, port, mode) VALUES (?, ?, ?, ?, ?, ?)`, [server.id, server.server, server.name, server.interval, server.port, server.mode], (err: Error) => {
      if (err) {
        console.error("Error adding server", err);
        reject(err);
      } else {
        resolve(null);
      }
    });
  });
}

function getServers(db: any) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT id, server, name, interval, port, mode FROM servers`, [], (err: Error, rows: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getServer(db: any, server: string) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT id, server, name, interval, port, mode FROM servers WHERE server = ?`, [server], (err: Error, row: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });

}

function addCredentials(db: any, ipmi: { address: string, flags: string, password: string, port: string, serverId: string,  username: string }) {
  return new Promise((resolve, reject) => {
    const accountId = "rackmanage_" + crypto.randomUUID();
    keytar.setPassword("rackmanage", accountId, ipmi.password).then(() => {
      try {
        db.run(`REPLACE INTO ipmi (server_id, address, username, credential, port, flags) VALUES (?, ?, ?, ?, ?, ?)`, [ipmi.serverId, ipmi.address, ipmi.username, accountId, ipmi.port, ipmi.flags], (err: Error) => {
          if (err) {
            console.error("Error adding IPMI credentials", err);
            reject(err);
          } else {
            resolve(null);
          }
        })
      } catch (error) {
        console.error("Error adding IPMI credentials");
        reject(error);
      }
    });
  });
}

function getCredential(db: any, serverId: string) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT server_id, address, username, credential, port, flags FROM ipmi WHERE server_id = ?`, [serverId], (err: Error, row: any) => {
      if (err) {
        reject(err);
      } else if (row) {
        resolve(row);
      } else {
        resolve(null);
      }
    });
  });
}

function getCredentials(db: any) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT server_id, address, username, credential, port, flags FROM ipmi`, [], (err: Error, rows: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function setConfigData(db: any, key: string, value: null|string) {
  return new Promise((resolve, reject) => {
    db.run(`REPLACE INTO config (key, value) VALUES (?, ?)`, [key, value], (err: Error) => {
      if (err) {
        console.error("Error setting config data", err);
        reject(err);
      } else {
        resolve(null);
      }
    });
  });
}

function getConfigData(db: any, key: string): Promise<null|string> {
  return new Promise((resolve, reject) => {
    db.get(`SELECT value FROM config WHERE key = ?`, [key], (err: Error, row: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.value : null);
      }
    });
  });
}

export {
  addCredentials,
  addServer,
  closeDb,
  getConfigData,
  getCredential,
  getCredentials,
  getServer,
  getServers,
  migrateDatabaseToSystemLocation,
  migrateDatabaseToUserLocation,
  openOrCreateDatabase,
  setConfigData,
};
