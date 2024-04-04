const fs = require("node:fs");
const { dataPath, dbName, findDatabasePath } = require("../../db/paths.ts");
const path = require("node:path");
const util = require("node:util");
const { exec } = require("node:child_process");
const execPromise = util.promisify(exec);
const {
  getEffectiveUidGid,
  isAdmin,
  recursiveChown,
  serviceInstalled,
  systemServicePath,
  userServicePath,
} = require("./index.ts");
const {
  migrateDatabaseToSystemLocation,
  migrateDatabaseToUserLocation,
} = require("../../db/index.ts");

async function install(serviceTemplate: string, serviceFileName: string, loadCommands: string[], mode: string) {
  if (!(await isAdmin()) && mode !== "login") {
    console.error("Please run this command as root");
    return;
  }

  const { systemPath, userPath } = dataPath();

  if (await serviceInstalled(serviceFileName)) {
    console.log(
      "Service already installed. Run `rmagent service uninstall` to remove the service."
    );
    return;
  }

  // Create the data directory if it doesn't exist
  if (
    !fs.existsSync(mode === "login" ? userPath : systemPath)
  ) {
    fs.mkdirSync(mode === "login" ? userPath : systemPath, {
      recursive: true,
    });
  }

  // Create the service directory if it doesn't exist
  if (
    !fs.existsSync(mode === "login" ? userServicePath() : systemServicePath())
  ) {
    fs.mkdirSync(mode === "login" ? userServicePath() : systemServicePath(), {
      recursive: true,
    });
  }

  // Copy the current executable to the user data directory
  fs.copyFileSync(
    process.argv[0],
    path.join(mode === "login" ? userPath : systemPath, "rmagent")
  );

  let serviceData = fs.readFileSync(serviceTemplate);
  serviceData = serviceData
    .toString()
    .replaceAll("{{DATA_DIR}}", mode === "login" ? userPath : systemPath);

  fs.writeFileSync(
    path.join(
      mode === "login" ? userServicePath() : systemServicePath(),
      serviceFileName
    ),
    serviceData
  );

  // Execute OS-specific load/start commands
  await Promise.all(loadCommands.map(async (command: string) => {
    await execPromise(command);
  }));

  if (mode === "login") {
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
  userUnloadCommands: string[],
  systemUnloadCommands: string[]
) {
  if (!(await serviceInstalled())) {
    console.error("Service not installed");
    return;
  }

  const { systemPath, userPath } = dataPath();
  const mode = findDatabasePath() === path.join(systemPath, dbName) ? "boot" : "login";

  if (!(await isAdmin()) && mode !== "login") {
    console.error("Please run this command as root");
    return;
  }

  (mode === "login") ?
    await Promise.all(userUnloadCommands.map(async (command: string) => {
      await execPromise(command);
    }))
  :
    await Promise.all(systemUnloadCommands.map(async (command: string) => {
      await execPromise(command);
    }))

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

  // Remove the executable
  if (
      fs.existsSync(
        path.join(mode === "login" ? userPath : systemPath, "rmagent")
      )
  ) {
    fs.unlinkSync(
      path.join(mode === "login" ? userPath : systemPath, "rmagent")
    );
  }

  migrateDatabaseToUserLocation();

  if (await isAdmin()) {
    const { gid, uid } = await getEffectiveUidGid();
    await recursiveChown(userPath, uid, gid);
  }

  console.log("Service uninstalled");
}

async function runCommands(userCommands: string[], systemCommands: string[]) {
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

    await Promise.all(userCommands.map(async (command: string) => {
      await execPromise(command);
    }));
  } else { 
    await Promise.all(systemCommands.map(async (command: string) => {
      await execPromise(command);
    }));
  }
}

export {
  install,
  runCommands,
  uninstall,
};
