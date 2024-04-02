const fs = require("fs");
const { dataPath, findDatabasePath, dbName } = require("../../db/paths");
const path = require("path");
const util = require("util");
const { exec } = require("child_process");
const execPromise = util.promisify(exec);
const {
  getEffectiveUidGid,
  recursiveChown,
  isAdmin,
  serviceInstalled,
  userServicePath,
  systemServicePath,
} = require("./index");
const {
  migrateDatabaseToUserLocation,
  migrateDatabaseToSystemLocation,
} = require("../../db");

async function install(serviceTemplate, serviceFileName, loadCommands, mode) {
  if (!(await isAdmin()) && mode !== "login") {
    console.error("Please run this command as root");
    return;
  }

  let { systemPath, userPath } = dataPath();

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
    .replace(/{{DATA_DIR}}/g, mode === "login" ? userPath : systemPath);

  fs.writeFileSync(
    path.join(
      mode === "login" ? userServicePath() : systemServicePath(),
      serviceFileName
    ),
    serviceData
  );

  // Execute OS-specific load/start commands
  for (const command of loadCommands) {
    await execPromise(command);
  }

  if (mode === "login") {
    migrateDatabaseToUserLocation();

    if (await isAdmin()) {
      const { uid, gid } = await getEffectiveUidGid();
      await recursiveChown(userPath, uid, gid);
    }
  } else {
    migrateDatabaseToSystemLocation();
  }

  console.log("Service installed");
}

async function uninstall(
  serviceFileName,
  userUnloadCommands,
  systemUnloadCommands,
) {
  if (!(await serviceInstalled())) {
    console.error("Service not installed");
    return;
  }

  let { userPath, systemPath } = dataPath();
  let mode = findDatabasePath() === path.join(systemPath, dbName) ? "boot" : "login";

  if (!(await isAdmin()) && mode !== "login") {
    console.error("Please run this command as root");
    return;
  }

  if (mode === "login") {
    for (const command of userUnloadCommands) {
      await execPromise(command);
    }
  } else {
    for (const command of systemUnloadCommands) {
      await execPromise(command);
    }
  }

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
    const { uid, gid } = await getEffectiveUidGid();
    await recursiveChown(userPath, uid, gid);
  }

  console.log("Service uninstalled");
}

async function runCommands(userCommands, systemCommands) {
  if (!(await serviceInstalled())) {
    console.error("Service not installed");
    return;
  }

  let { systemPath } = dataPath();
  let mode = findDatabasePath() === path.join(systemPath, dbName) ? "boot" : "login";

  if (mode === "boot") {
    if (!isAdmin()) {
      console.error("Please run this command as root.");
      return;
    }

    for (const command of systemCommands) {
      await execPromise(command);
    }
  } else { 
    for (const command of userCommands) {
      await execPromise(command);
    }
  }
}

module.exports = {
  install,
  uninstall,
  runCommands,
};
