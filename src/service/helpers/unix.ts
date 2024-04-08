const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const util = require("node:util");
const { exec } = require("node:child_process");
const execPromise = util.promisify(exec);
import { confirm } from 'promptly'

import {
  migrateDatabaseToSystemLocation,
  migrateDatabaseToUserLocation,
} from "../../db"
import { dataPath, dbName, findDatabasePath } from "../../db/paths"
import {
  getEffectiveUidGid,
  isAdmin,
  recursiveChown,
  serviceInstalled,
  systemServicePath,
  userServicePath,
} from "./index"

// TO-DO: Fix false-positive stderr on linux
async function sequentialCommands(commands: { command: string, ignoreErrors: boolean }[]) {
  for (const command of commands) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const { stderr } = await execPromise(command.command);
      if (stderr && !command.ignoreErrors) {
        console.error(`Error executing command: ${command.command}`);
        console.error(stderr);
      }
    } catch (error) {
      if (!command.ignoreErrors) {
        console.error(`Failed to execute command: ${command.command}`);
        console.error(error);
      }
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// eslint-disable-next-line complexity
async function install(config: {
  loadCommands: { command: string, ignoreErrors: boolean }[],
  mode: string,
  root: string,
  serviceFileName: string,
  serviceTemplate: string,
}) {

  let targetProcess = null;
  let nodePath = process.argv[0];

  if (fs.existsSync(path.join(config.root, "bin", "node")) && fs.existsSync(path.join(config.root, "bin", "run.js"))) {
    targetProcess = path.join(config.root, "bin", "run.js");
    nodePath = path.join(config.root, "bin", "node");
  } else if (fs.existsSync(path.join(config.root, "bin", "run.js"))) {
      targetProcess = `${path.join(config.root, "bin", "run.js")}`;
  } else {
    console.error("Unable to find service executable");
    return;
  }

  if (config.mode === "boot" && os.platform() === "darwin" && config.root.includes("/Users/")) {
    console.error("Service cannot be installed with application in user directory. Please move the application out of /Users (e.g. /Library/Application Support/RackManage) and try again.");
    return;
  }

  const admin = await isAdmin();
  if (!(admin) && config.mode !== "login") {
    console.error("Please run this command as root");
    return;
  } 
  
  if (admin && config.mode === "login") {
    console.log("WARNING: Running as root in login mode. This may lead to errors.");
    const response = await confirm("Do you want to continue? (y/n)");
    if (!response) {
      return;
    }
  }

  const { systemPath, userPath } = dataPath();

  if (await serviceInstalled()) {
    console.log(
      "Service already installed. Run `rmagent service uninstall` to remove the service."
    );
    return;
  }

  // Create the data directory if it doesn't exist
  if (
    !fs.existsSync(config.mode === "login" ? userPath : systemPath)
  ) {
    await fs.mkdirSync(config.mode === "login" ? userPath : systemPath, {
      recursive: true,
    });
  }

  // Create the service directory if it doesn't exist
  if (
    !fs.existsSync(config.mode === "login" ? userServicePath() : systemServicePath())
  ) {
    await fs.mkdirSync(config.mode === "login" ? userServicePath() : systemServicePath(), {
      recursive: true,
    });
  }

  let serviceData = fs.readFileSync(config.serviceTemplate);
  serviceData = serviceData
    .toString()
    .replaceAll("{{EXE_PATH1}}", nodePath)
    .replaceAll("{{EXE_PATH2}}", targetProcess)
    .replaceAll("{{DATA_DIR}}", config.mode === "login" ? userPath : systemPath)
    .replaceAll("{{WORKING_DIR}}", config.root);

  await fs.writeFileSync(
    path.join(
      config.mode === "login" ? userServicePath() : systemServicePath(),
      config.serviceFileName
    ),
    serviceData
  );

  // Wait for the file to be written
  await sleep(1000);

  // Execute OS-specific load/start commands
  await sequentialCommands(config.loadCommands);

  if (config.mode === "login") {
    migrateDatabaseToUserLocation();

    if (await isAdmin()) {
      const { gid, uid } = await getEffectiveUidGid();
      await recursiveChown(userPath, uid, gid);
    }
  } else {
    migrateDatabaseToSystemLocation();
  }

  console.log("Service installed");
}

async function uninstall(
  serviceFileName: string,
  userUnloadCommands: { command: string, ignoreErrors: boolean }[],
  systemUnloadCommands: { command: string, ignoreErrors: boolean }[]
) {
  if (!(await serviceInstalled())) {
    console.error("Service not installed");
    return;
  }

  const { systemPath, userPath } = dataPath();
  const mode = findDatabasePath() === path.join(systemPath, dbName) ? "boot" : "login";

  const admin = await isAdmin();
  if (!(admin) && mode !== "login") {
    console.error("Please run this command as root");
    return;
  }

  if (admin && mode === "login") {
    console.log("WARNING: Running as root in login mode. This may lead to errors.");
    const response = await confirm("Do you want to continue? (y/n)");
    if (!response) {
      return;
    }
  }

  (mode === "login") ?
    await sequentialCommands(userUnloadCommands)
  :
    await sequentialCommands(systemUnloadCommands);

  // Remove the service file
  if (
      fs.existsSync(path.join(
          mode === "login" ? userServicePath() : systemServicePath(),
          serviceFileName
        )
      )
  ) {
    fs.unlinkSync(
      path.join(
        mode === "login" ? userServicePath() : systemServicePath(),
        serviceFileName
      )
    );
  }

  migrateDatabaseToUserLocation();

  if (await isAdmin()) {
    const { gid, uid } = await getEffectiveUidGid();
    await recursiveChown(userPath, uid, gid);
  }

  console.log("Service uninstalled");
}

async function runCommands(userCommands: { command: string, ignoreErrors: boolean }[], systemCommands: { command: string, ignoreErrors: boolean }[]) {
  if (!(await serviceInstalled())) {
    console.error("Service not installed");
    return;
  }

  const { systemPath } = dataPath();
  const mode = findDatabasePath() === path.join(systemPath, dbName) ? "boot" : "login";

  if (mode === "boot") {
    if (!isAdmin()) {
      console.error("Please run this command as root.");
      return;
    }

    await sequentialCommands(systemCommands);
  } else { 
    await sequentialCommands(userCommands);
  }
}

export {
  install,
  runCommands,
  uninstall,
};
