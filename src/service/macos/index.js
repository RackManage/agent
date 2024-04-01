const os = require("os");
const path = require("path");
const { dataPath, findDatabasePath, dbName } = require("../../db/paths");
const util = require("util");
const { exec } = require("child_process");
const execPromise = util.promisify(exec);
const fs = require("fs");
const fsPromises = fs.promises;
const {
  migrateDatabaseToUserLocation,
  migrateDatabaseToSystemLocation,
} = require("../../db");

const launchDaemonsPath = path.join("/", "Library", "LaunchDaemons");
const launchAgentsPath = path.join(os.homedir(), "Library", "LaunchAgents");

async function getEffectiveUidGid() {
  const sudoUser = process.env.SUDO_USER;
  const sudoUid = process.env.SUDO_UID;
  const sudoGid = process.env.SUDO_GID;

  // If the process is run with sudo, use the SUDO_* environment variables
  if (sudoUser) {
    return { username: sudoUser, uid: parseInt(sudoUid, 10), gid: parseInt(sudoGid, 10) };
  } else {
    // If not run with sudo, fall back to the current process's user info
    const username = os.userInfo().username;
    // Use `id` command to get uid and gid to avoid requiring additional node modules
    try {
      const { stdout } = await execPromise(`id -u ${username}`);
      const uid = parseInt(stdout.trim(), 10);
      const { stdout: gidStdout } = await execPromise(`id -g ${username}`);
      const gid = parseInt(gidStdout.trim(), 10);
      return { username, uid, gid };
    } catch (error) {
      console.error("Failed to get user id and group id:", error);
      throw error;
    }
  }
}

async function recursiveChown(dirPath, uid, gid) {
  try {
    await fsPromises.chown(dirPath, uid, gid);
    const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        await recursiveChown(fullPath, uid, gid);
      } else {
        await fsPromises.chown(fullPath, uid, gid);
      }
    }
  } catch (error) {
    console.error(`Error changing ownership for ${dirPath}:`, error);
  }
}

async function installService(mode) {
  let { userPath, systemPath } = dataPath();

  try {
    if (mode == "login") {
      // Check if service is already installed
      if (
        fs.existsSync(
          path.join(launchAgentsPath, "io.rackmanage.rmagent.plist")
        )
      ) {
        console.error("Service already installed");
        return;
      }

      // Create the user data directory if it doesn't exist
      if (!fs.existsSync(userPath)) {
        fs.mkdirSync(userPath, { recursive: true });
      }

      // Copy the current executable to the user data directory
      fs.copyFileSync(process.argv[0], path.join(userPath, "rmagent"));

      // Create the service file
      let serviceData = fs.readFileSync(
        path.join(__dirname, "io.rackmanage.rmagent.plist.tpl")
      );

      // Replace the placeholder with the actual path
      serviceData = serviceData.toString().replace(/{{DATA_DIR}}/g, userPath);

      // Write the service file
      fs.writeFileSync(
        path.join(launchAgentsPath, "io.rackmanage.rmagent.plist"),
        serviceData
      );

      // Check if service is already loaded
      if (await isRunning()) {
        // Reload the service
        await execPromise(
          `launchctl unload ${path.join(
            launchAgentsPath,
            "io.rackmanage.rmagent.plist"
          )}`
        );
        await execPromise(
          `launchctl load ${path.join(
            launchAgentsPath,
            "io.rackmanage.rmagent.plist"
          )}`
        );
      } else {
        // Load the service
        await execPromise(
          `launchctl load ${path.join(
            launchAgentsPath,
            "io.rackmanage.rmagent.plist"
          )}`
        );
      }

      migrateDatabaseToUserLocation();

      // If we're running as root, change ownership of the user data directory
      if (os.userInfo().uid === 0) {
        const { uid, gid } = await getEffectiveUidGid();
        await recursiveChown(userPath, uid, gid);
      }

      console.log("Service installed");
    } else {
      // Make sure we're running as root
      if (os.userInfo().uid !== 0) {
        console.error("Please run this command as sudo");
        return;
      }

      // Check if service is already installed
      if (
        fs.existsSync(
          path.join(launchDaemonsPath, "io.rackmanage.rmagent.plist")
        )
      ) {
        console.error("Service already installed");
        return;
      }

      // Create the system data directory if it doesn't exist
      if (!fs.existsSync(systemPath)) {
        fs.mkdirSync(systemPath, { recursive: true });
      }

      // Copy the current executable to the system data directory
      fs.copyFileSync(process.argv[0], path.join(systemPath, "rmagent"));

      // Create the service file
      let serviceData = fs.readFileSync(
        path.join(__dirname, "io.rackmanage.rmagent.plist.tpl")
      );

      // Replace the placeholder with the actual path
      serviceData = serviceData.toString().replace(/{{DATA_DIR}}/g, systemPath);

      // Write the service file
      fs.writeFileSync(
        path.join(launchDaemonsPath, "io.rackmanage.rmagent.plist"),
        serviceData
      );

      // Check if service is already loaded
      if (await isRunning()) {
        // Reload the service
        await execPromise(
          `sudo launchctl unload ${path.join(
            launchDaemonsPath,
            "io.rackmanage.rmagent.plist"
          )}`
        );
        await execPromise(
          `sudo launchctl load ${path.join(
            launchDaemonsPath,
            "io.rackmanage.rnagent.plist"
          )}`
        );
      } else {
        // Load the service
        await execPromise(
          `sudo launchctl load ${path.join(
            launchDaemonsPath,
            "io.rackmanage.rmagent.plist"
          )}`
        );
      }

      migrateDatabaseToSystemLocation();

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
      // Make sure we're running as root
      if (os.userInfo().uid !== 0) {
        console.error("Please run this command as sudo");
        return;
      }

      // Check if service is already loaded
      if (await isRunning()) {
        // Unload the service
        await execPromise(
          `sudo launchctl unload ${path.join(
            launchDaemonsPath,
            "io.rackmanage.rmagent.plist"
          )}`
        );
      }

      // Remove the service file
      if (
        fs.existsSync(
          path.join(launchDaemonsPath, "io.rackmanage.rmagent.plist")
        )
      ) {
        fs.unlinkSync(
          path.join(launchDaemonsPath, "io.rackmanage.rmagent.plist")
        );
      }

      // Remove the executable
      if (fs.existsSync(path.join(systemPath, "rmagent"))) {
        fs.unlinkSync(path.join(systemPath, "rmagent"));
      }

      migrateDatabaseToUserLocation();

      // If we're running as root, change ownership of the user data directory
      if (os.userInfo().uid === 0) {
        const { uid, gid } = await getEffectiveUidGid();
        await recursiveChown(userPath, uid, gid);
      }

      console.log("Service uninstalled");
    } else {
      // Check if service is already loaded
      if (await isRunning()) {
        // Unload the service
        await execPromise(
          `launchctl unload ${path.join(
            launchAgentsPath,
            "io.rackmanage.rmagent.plist"
          )}`
        );
      }

      // Remove the service file
      if (
        fs.existsSync(
          path.join(launchAgentsPath, "io.rackmanage.rmagent.plist")
        )
      ) {
        fs.unlinkSync(
          path.join(launchAgentsPath, "io.rackmanage.rmagent.plist")
        );
      }

      // Remove the executable
      if (fs.existsSync(path.join(userPath, "rmagent"))) {
        fs.unlinkSync(path.join(userPath, "rmagent"));
      }

      // If we're running as root, change ownership of the user data directory
      if (os.userInfo().uid === 0) {
        const { uid, gid } = await getEffectiveUidGid();
        await recursiveChown(userPath, uid, gid);
      }

      console.log("Service uninstalled");
    }
  } catch (err) {
    console.error(err);
  }
}

async function startService() {
  try {
    // If the database is in the system path then we are running in system mode
    let { systemPath } = dataPath();

    if (findDatabasePath() === path.join(systemPath, dbName)) {
      // Make sure we're running as root
      if (os.userInfo().uid !== 0) {
        console.error("Please run this command as sudo");
        return;
      }

      // Check if service is already running
      if (!(await isRunning())) {
        // Load the service
        await execPromise(`sudo launchctl start io.rackmanage.rmagent`);
      }

      console.log("Service started");
    } else {
      // Check if service is already running
      if (!(await isRunning())) {
        // Load the service
        await execPromise(`launchctl start io.rackmanage.rmagent`);
      }
    }

    console.log("Service started");
  } catch (err) {
    console.log("Unable to start service");
  }
}

async function stopService() {
  try {
    // If the database is in the system path then we are running in system mode
    let { systemPath } = dataPath();

    if (findDatabasePath() === path.join(systemPath, dbName)) {
      // Make sure we're running as root
      if (os.userInfo().uid !== 0) {
        console.error("Please run this command as sudo");
        return;
      }

      // Check if service is already running
      if (await isRunning()) {
        // Stop the service
        await execPromise(`sudo launchctl stop io.rackmanage.rmagent`);
      }

      console.log("Service stopped");
    } else {
      // Check if service is already running
      if (await isRunning()) {
        // Stop the service
        await execPromise(`launchctl stop io.rackmanage.rmagent`);
      }
    }

    console.log("Service stopped");
  } catch (err) {
    console.log("Unable to stop service");
  }
}

async function isRunning() {
  try {
    // If the database is in the system path then we are running in system mode
    let { systemPath } = dataPath();

    if (findDatabasePath() === path.join(systemPath, dbName)) {
      // Check if service is already running
      let { stdout, stderr } = await execPromise(
        `sudo launchctl list | grep io.rackmanage.rmagent`
      );
      if (stdout) {
        return true;
      } else if (stderr) {
        return false;
      }
    } else {
      // Check if service is already running
      let { stdout, stderr } = await execPromise(
        `launchctl list | grep io.rackmanage.rmagent`
      );
      if (stdout) {
        return true;
      } else if (stderr) {
        return false;
      }
    }

    return false;
  } catch (err) {
    return false;
  }
}

module.exports = {
  installService,
  uninstallService,
  startService,
  stopService,
  isRunning,
};
