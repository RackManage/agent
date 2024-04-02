const fs = require("fs");
const os = require("os");
const path = require("path");
const dbName = "rmagent.db";

/**
 * Get the paths for the user and system data directories
 * based on the current operating system
 * @returns {Object} An object containing the paths
 */
function dataPath() {
  let userPath, systemPath;
  switch (os.platform()) {
    case "win32":
      userPath = path.join(process.env.APPDATA, "RackManage");
      systemPath = path.join(process.env.ProgramData, "RackManage");
      break;
    case "darwin":
      userPath = path.join(os.homedir(), "Library", "Application Support", "RackManage");
      systemPath = path.join("/", "Library", "Application Support", "RackManage");
      break;
    case "linux":
      if (os.userInfo().uid === 0 && process.env.SUDO_USER) {
        userPath = path.join("/home", process.env.SUDO_USER, ".config", "RackManage");
      } else {
        userPath = path.join(os.homedir(), ".config", "RackManage");
      }
      systemPath = path.join("/var/lib", "RackManage");
      break;
  }

  if (!userPath || !systemPath) {
    throw new Error("Unsupported platform");
  }

  return { userPath, systemPath };
}

/**
 * Find the path to the current database file
 * @returns {string} The path to the database file
 */
function findDatabasePath() {
  let { userPath, systemPath } = dataPath();

  if (fs.existsSync(path.join(systemPath, dbName))) {
    return path.join(systemPath, dbName);
  } else {
    return path.join(userPath, dbName);
  }
}

module.exports = {
  dataPath,
  findDatabasePath,
  dbName,
};