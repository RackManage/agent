const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const os = require("os");
const path = require("path");
const { dataPath, findDatabasePath, dbName } = require("./paths");

function migrateDatabaseToUserLocation() {
  let { userPath, systemPath } = dataPath();

  // If the database is not in the user path then copy it there
  if (findDatabasePath() !== path.join(userPath, dbName)) {
    if (os.userInfo().uid !== 0) {
      console.error("Please run this command as sudo");
      return;
    }
    
    if (fs.existsSync(path.join(systemPath, dbName))) {
      fs.copyFileSync(path.join(systemPath, dbName), path.join(userPath, dbName));

      // If file copied successfully then remove the original
      if (fs.existsSync(path.join(userPath, dbName))) {
        fs.unlinkSync(path.join(systemPath, dbName));
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
    if (os.userInfo().uid !== 0) {
      console.error("Please run this command as sudo");
      return;
    }

    if (fs.existsSync(path.join(userPath, dbName))) {
      fs.copyFileSync(path.join(userPath, dbName), path.join(systemPath, dbName));
      
      // If file copied successfully then remove the original
      if (fs.existsSync(path.join(systemPath, dbName))) {
        fs.unlinkSync(path.join(userPath, dbName));
      } else {
        console.error("Error migrating database. Please check permissions.");
      }
    }
  }
}

function openOrCreateDatabase(dbPath = findDatabasePath()) {
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
        initializeDatabase(db).then(() => resolve(db));
      }
    });
  });
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
  addServer,
  getServers,
  setConfigData,
  getConfigData,
  migrateDatabaseToSystemLocation,
  migrateDatabaseToUserLocation,
};
