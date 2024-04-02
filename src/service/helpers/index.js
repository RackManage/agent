const os = require("os");
const util = require("util");
const { exec } = require("child_process");
const execPromise = util.promisify(exec);
const { dataPath } = require("../../db/paths");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");


async function isAdmin() {
  switch (os.platform()) {
    case "win32":
      return new Promise((resolve, reject) => {
        execPromise("net session", (error, stdout, stderr) => {
          if (error) {
            resolve(false);
          } else {
            resolve(true);
          }
        }).catch(() => {
          resolve(false);
        });
      });
    case "darwin":
    case "linux":
      return os.userInfo().uid === 0;
    default:
      throw new Error("Unsupported platform");
  }
}

async function getEffectiveUidGid() {
  const sudoUser = process.env.SUDO_USER;
  const sudoUid = process.env.SUDO_UID;
  const sudoGid = process.env.SUDO_GID;

  // If the process is run with sudo, use the SUDO_* environment variables
  if (sudoUser) {
    return {
      username: sudoUser,
      uid: parseInt(sudoUid, 10),
      gid: parseInt(sudoGid, 10),
    };
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

function userServicePath() {
  let { userPath } = dataPath();
  switch (os.platform()) {
    case "win32":
      return userPath;
    case "darwin":
      return path.join(os.homedir(), "Library", "LaunchAgents");
    case "linux":
      return path.join(os.homedir(), ".config/systemd/user");
    default:
      throw new Error("Unsupported platform");
  }
}

function systemServicePath() {
  let { systemPath } = dataPath();
  switch (os.platform()) {
    case "win32":
      return systemPath;
    case "darwin":
      return path.join("/", "Library", "LaunchDaemons");
    case "linux":
      return "/etc/systemd/system";
    default:
      throw new Error("Unsupported platform");
  }
}

async function serviceInstalled() {
  switch (os.platform()) {
    case "win32":
      if (fs.existsSync(path.join(userServicePath(), "rmagent.exe"))) {
        return true;
      }

      if (fs.existsSync(path.join(systemServicePath(), "rmservice.exe"))) {
        return true;
      }

      return false;
    case "darwin":
      if (
        fs.existsSync(
          path.join(userServicePath(), "io.rackmanage.rmagent.plist")
        )
      ) {
        return true;
      }

      if (
        fs.existsSync(
          path.join(systemServicePath(), "io.rackmanage.rmagent.plist")
        )
      ) {
        return true;
      }

      return false;
    case "linux":
      if (fs.existsSync(path.join(userServicePath(), "rmagent.service"))) {
        return true;
      }

      if (fs.existsSync(path.join(systemServicePath(), "rmagent.service"))) {
        return true;
      }

      return false;
    default:
      throw new Error("Unsupported platform");
  }
}

module.exports = {
  isAdmin,
  getEffectiveUidGid,
  recursiveChown,
  userServicePath,
  systemServicePath,
  serviceInstalled,
};