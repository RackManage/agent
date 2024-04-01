const os = require("os");
const path = require("path");
const { dataPath, findDatabasePath, dbName } = require("../db/paths");
const util = require('util');
const { exec } = require("child_process");
const execPromise = util.promisify(exec);
const fs = require("fs");

const launchDaemonsPath = path.join("/", "Library", "LaunchDaemons");
const launchAgentsPath = path.join(os.homedir(), "Library", "LaunchAgents");

async function isAdmin() {
  return await execPromise('net session', function(err, stdout, stderr) {
    if (err || !(stdout.indexOf("There are no entries in the list.") > -1)) {
      return false;
    } else {
      return true;
    }
});
}

async function installService(mode) {
  let { userPath, systemPath } = dataPath();

  try {
    if (mode == "user") {
      console.log("Service installed");
    } else {
      // Make sure we're running as admin
      if (!await isAdmin()) {
        console.error("Please run this command as admin");
        return;
      }

      console.log("Service installed");
    }
  } catch (err) {
    console.error(err);
  }
}

async function uninstallService() {
  try {
    // If the database is in the system path then we are running in system mode
    let { userPath, systemPath } = dataPath();

    if (findDatabasePath() === path.join(systemPath, dbName)) {
      // Make sure we're running as admin
      if (!await isAdmin()) {
        console.error("Please run this command as admin");
        return;
      }

      console.log("Service uninstalled");
    } else {
      
      console.log("Service uninstalled");
    }
  } catch (err) {
    console.error(err);
  }
}

async function startService() {
  console.log("Starting services on Windows is not supported by rmagent. Please manually start the service or use Services to start the service.");
}

async function stopService() {
  console.log("Stopping services on Windows is not supported by rmagent. Please use Task Manager or Services to stop the service.");
}

module.exports = {
  installService,
  uninstallService,
  startService,
  stopService,
};