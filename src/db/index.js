const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const fsPromises = fs.promises;
const os = require("os");
const path = require("path");
const { dataPath, findDatabasePath, dbName } = require("./paths");
const { isAdmin, getEffectiveUidGid } = require("../service/helpers");
const { exit } = require("process");

function deleteWithRetry(filePath, maxRetries = 5, interval = 100, attempt = 0) {
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
  let { userPath, systemPath } = dataPath();

  // If the database is not in the user path then copy it there
  if (findDatabasePath() !== path.join(userPath, dbName)) {
    if (fs.existsSync(path.join(systemPath, dbName))) {
      fs.copyFileSync(path.join(systemPath, dbName), path.join(userPath, dbName));

      // If file copied successfully then remove the original
      if (fs.existsSync(path.join(userPath, dbName))) {
        deleteWithRetry(path.join(systemPath, dbName));
      } else {
        console.error("Error migrating database. Please check permissions.");
      }
    }
  }
}

function migrateDatabaseToSystemLocation() {
  let { userPath, systemPath } = dataPath();

  // If the database is not in the system path then copy it there
  if (findDatabasePath() !== path.join(systemPath, dbName)) {
    if (fs.existsSync(path.join(userPath, dbName))) {
      fs.copyFileSync(path.join(userPath, dbName), path.join(systemPath, dbName));
      
      // If file copied successfully then remove the original
      if (fs.existsSync(path.join(systemPath, dbName))) {
        deleteWithRetry(path.join(userPath, dbName));
      } else {
        console.error("Error migrating database. Please check permissions.");
      }
    }
  }
}

async function openOrCreateDatabase(dbPath = findDatabasePath()) {
  let { systemPath, userPath } = dataPath();
  if (dbPath.startsWith(systemPath)) {
    if (!(await isAdmin())) {
      console.error("Please run this command as root");
      exit(1);
    }
  } else {
    const dir = path.dirname(dbPath);
    if (fs.existsSync(dir) && await isAdmin() && dbPath.startsWith(userPath)) {
      const { uid, gid } = await getEffectiveUidGid();
      await fsPromises.chown(dir, uid, gid);
    }

    if (fs.existsSync(dbPath) && await isAdmin() && dbPath.startsWith(userPath)) {
      const { uid, gid } = await getEffectiveUidGid();
      await fsPromises.chown(dbPath, uid, gid);
    }
  }

  return new Promise((resolve, reject) => {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error("Could not open database", err);
        reject(err);
      } else {
        initializeDatabase(db).then(async () => resolve(db));
      }
    });
  });
}

async function closeDb(db, dbPath = findDatabasePath()) {
  let { userPath } = dataPath();
  const dir = path.dirname(dbPath);
  
  if (fs.existsSync(dir) && await isAdmin() && dbPath.startsWith(userPath)) {
    const { uid, gid } = await getEffectiveUidGid();
    await fsPromises.chown(dir, uid, gid);
  }

  if (fs.existsSync(dbPath) && await isAdmin() && dbPath.startsWith(userPath)) {
    const { uid, gid } = await getEffectiveUidGid();
    await fsPromises.chown(dbPath, uid, gid);
  }

  db.close();
}

function initializeDatabase(db) {
  return new Promise(async (resolve, reject) => {
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
      )`, [], (err) => {
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
      )`, [], (err) => {
        if (err) {
          console.error("Error creating servers table", err);
          reject(err);
        } else {
          resolve();
        }
      });

      db.run(`CREATE TABLE IF NOT EXISTS ipmi (
        id TEXT PRIMARY KEY NOT NULL,
        server TEXT KEY NOT NULL,
        address TEXT NOT NULL,
        username TEXT,
        credential TEXT
      )`, [], (err) => {
        if (err) {
          console.error("Error creating ipmi table", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

function addServer(db, server) {
  return new Promise((resolve, reject) => {
    db.run(`REPLACE INTO servers (id, server, name, interval, port, mode) VALUES (?, ?, ?, ?, ?, ?)`, [server.id, server.server, server.name, server.interval, server.port, server.mode], (err) => {
      if (err) {
        console.error("Error adding server", err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function getServers(db) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT id, server, name, interval, port, mode FROM servers`, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getServer(db, server) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT id, server, name, interval, port, mode FROM servers WHERE server = ?`, [server], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });

}

function addCredentials(db, ipmi) {
  return new Promise((resolve, reject) => {
    db.run(`REPLACE INTO ipmi (id, server, address, username, credential) VALUES (?, ?, ?, ?, ?)`, [ipmi.id, ipmi.server, ipmi.address, ipmi.username, ipmi.credential], (err) => {
      if (err) {
        console.error("Error adding IPMI credentials", err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function setConfigData(db, key, value) {
  return new Promise((resolve, reject) => {
    db.run(`REPLACE INTO config (key, value) VALUES (?, ?)`, [key, value], (err) => {
      if (err) {
        console.error("Error setting config data", err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function getConfigData(db, key) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT value FROM config WHERE key = ?`, [key], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.value : null);
      }
    });
  });
}

module.exports = {
  openOrCreateDatabase,
  closeDb,
  addServer,
  getServers,
  setConfigData,
  getConfigData,
  migrateDatabaseToSystemLocation,
  migrateDatabaseToUserLocation,
  getServer,
  addCredentials,
};
