const os = require("node:os");
const util = require("node:util");
const { exec } = require("node:child_process");
const execPromise = util.promisify(exec);
const fs = require("node:fs");
const fsPromises = fs.promises;
const path = require("node:path");
const Registry = require("winreg");

import { dataPath } from "../../db/paths"

async function isAdmin() {
  switch (os.platform()) {
    case "win32": {
      return new Promise((resolve, _) => {
        execPromise("net session", (error: any) => {
          if (error) {
            resolve(false);
          } else {
            resolve(true);
          }
        }).catch(() => {
          resolve(false);
        });
      });
    }

    case "darwin":
    case "linux": {
      return os.userInfo().uid === 0;
    }

    default: {
      throw new Error("Unsupported platform");
    }
  }
}

async function getEffectiveUidGid() {
  const sudoUser = process.env.SUDO_USER;
  const sudoUid = process.env.SUDO_UID;
  const sudoGid = process.env.SUDO_GID;

  // If the process is run with sudo, use the SUDO_* environment variables
  if (sudoUser) {
    if (!sudoUid || !sudoGid) {
      throw new Error("SUDO_USER set without SUDO_UID or SUDO_GID");
    }

    return {
      gid: Number.parseInt(sudoGid, 10),
      uid: Number.parseInt(sudoUid, 10),
      username: sudoUser,
    };
  }

  // If not run with sudo, fall back to the current process's user info
  const { username } = os.userInfo();
  // Use `id` command to get uid and gid to avoid requiring additional node modules
  try {
    const { stdout } = await execPromise(`id -u ${username}`);
    const uid = Number.parseInt(stdout.trim(), 10);
    const { stdout: gidStdout } = await execPromise(`id -g ${username}`);
    const gid = Number.parseInt(gidStdout.trim(), 10);
    return { gid, uid, username };
  } catch (error) {
    console.error("Failed to get user id and group id:", error);
    throw error;
  }
}

async function recursiveChown(dirPath: string, uid: number, gid: number) {
  try {
    await fsPromises.chown(dirPath, uid, gid);
    const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });

    await Promise.all(entries.map(async (entry: any) => {
      const fullPath = path.join(dirPath, entry.name);
      (entry.isDirectory()) ?
        await recursiveChown(fullPath, uid, gid)
      :
        await fsPromises.chown(fullPath, uid, gid);
    }));
  } catch (error) {
    console.error(`Error changing ownership for ${dirPath}:`, error);
  }
}

function userServicePath() {
  const { userPath } = dataPath();
  switch (os.platform()) {
    case "win32": {
      return userPath;
    }

    case "darwin": {
      return path.join(os.homedir(), "Library", "LaunchAgents");
    }

    case "linux": {
      return path.join(os.homedir(), ".config/systemd/user");
    }

    default: {
      throw new Error("Unsupported platform");
    }
  }
}

function systemServicePath() {
  const { systemPath } = dataPath();
  switch (os.platform()) {
    case "win32": {
      return systemPath;
    }

    case "darwin": {
      return path.join("/", "Library", "LaunchDaemons");
    }

    case "linux": {
      return "/etc/systemd/system";
    }

    default: {
      throw new Error("Unsupported platform");
    }
  }
}

async function serviceInstalled() {
  switch (os.platform()) {
    case "win32": {
      const regKey = new Registry({
        hive: Registry.HKCU,
        key: "\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
      });

      const regCheck = await new Promise((resolve, _) => {
        regKey.get("RackManage", (err: any, item: any) => {
          if (err) {
            resolve(null);
          } else {
            resolve(item.value);
          }
        });
      });

      if (regCheck) {
        return true;
      }

      if (fs.existsSync(path.join(systemServicePath(), "rmservice.exe"))) {
        return true;
      }

      return false;
    }

    case "darwin": {
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
    }

    case "linux": {
      if (fs.existsSync(path.join(userServicePath(), "rmagent.service"))) {
        return true;
      }

      if (fs.existsSync(path.join(systemServicePath(), "rmagent.service"))) {
        return true;
      }

      return false;
    }

    default: {
      throw new Error("Unsupported platform");
    }
  }
}

export {
  getEffectiveUidGid,
  isAdmin,
  recursiveChown,
  serviceInstalled,
  systemServicePath,
  userServicePath,
};