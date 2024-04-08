const path = require("node:path");
const util = require('node:util');
const { exec } = require("node:child_process");
const execPromise = util.promisify(exec);
const fs = require("node:fs");
const Registry = require("winreg");

import {
  migrateDatabaseToSystemLocation,
  migrateDatabaseToUserLocation,
} from "../../db"
import { dataPath, dbName, findDatabasePath } from "../../db/paths"
import {
  isAdmin,
  serviceInstalled,
} from "../helpers"

async function installService(root: string, mode: string) {
  const {  systemPath } = dataPath();

  let targetProcess = null;

  if (fs.existsSync(path.join(root, "bin", "rmagent.cmd"))) {
    targetProcess = path.join(root, "bin", "rmagent.cmd");
  } else if (fs.existsSync(path.join(root, "bin", "run.cmd"))) {
    targetProcess = path.join(root, "bin", "run.cmd");
  } else {
    console.error("Unable to find service executable");
    return;
  }

  try {
    if (mode === "login") {
      // Check if service is already installed
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
        console.log("Service already installed");
        return;
      }

      const regValue = `"${targetProcess}" start-monitoring --path "${findDatabasePath()}"`;

      // Add the service to the registry
      regKey.set("RackManage", Registry.REG_SZ, regValue, (err: any) => {
        if (err) {
          console.error(err);
        }
      });

      console.log("Service installed");
    } else {
      if (!await isAdmin()) {
        console.error("Please run this command as admin");
        return;
      }

      if (fs.existsSync(path.join(systemPath, "rmservice.exe"))) {
        console.log("Service already installed");
        return;
      }

      // Create the system data directory if it doesn't exist
      if (!fs.existsSync(systemPath)) {
        fs.mkdirSync(systemPath, { recursive: true });
      }

      // Copy the service wrapper to the system data directory
      fs.copyFileSync(path.join(__dirname, "rmservice.exe"), path.join(systemPath, "rmservice.exe"));

      // Replace the placeholder with the actual path
      let serviceData = fs.readFileSync(path.join(__dirname, "rmservice.xml.tpl"));
      serviceData = serviceData
        .toString()
        .replaceAll("{{EXE_PATH}}", targetProcess)
        .replaceAll("{{DATA_DIR}}", root);
      fs.writeFileSync(path.join(systemPath, "rmservice.xml"), serviceData);

      // Call rmservice.exe install to install the service
      const { stderr } = await execPromise(`"${path.join(systemPath, "rmservice.exe")}" install`);

      if (stderr) {
        console.error(stderr);
        return;
      }

      migrateDatabaseToSystemLocation();

      console.log("Service installed");
    }
  } catch (error: any) {
    console.error(error);
  }
}

async function uninstallService() {
  if (!(await serviceInstalled())) {
    console.error("Service not installed");
    return;
  }

  const { systemPath } = dataPath();
  const mode = findDatabasePath() === path.join(systemPath, dbName) ? "boot" : "login";

  if (!(await isAdmin()) && mode !== "login") {
    console.error("Please run this command as root");
    return;
  }

  try {
    if (mode === "login") {
      // Remove the service from the registry
      const regKey = new Registry({
        hive: Registry.HKCU,
        key: "\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
      });
      
      regKey.remove("RackManage", (err: any) => {
        if (err) {
          console.error(err);
        }
      });

      console.log("Service uninstalled");
    } else {
      if (!fs.existsSync(path.join(systemPath, "rmservice.exe"))) {
        console.log("Service not installed");
        return;
      }

      // Check if service is already installed
      const { stderr, stdout } = await execPromise(`"${path.join(systemPath, "rmservice.exe")}" status`);

      if (stderr) {
        console.error(stderr);
        return;
      }

      if (stdout.includes("NonExistent")) {
        console.log("Service not installed");
      } else {
        // Call rmservice.exe uninstall to uninstall the service
        const { stderr: stderr2 } = await execPromise(`"${path.join(systemPath, "rmservice.exe")}" uninstall`);

        if (stderr2) {
          console.error(stderr2);
          return;
        }
      }

      // Remove the service wrapper from the system data directory
      if (fs.existsSync(path.join(systemPath, "rmservice.exe"))) {
        fs.unlinkSync(path.join(systemPath, "rmservice.exe"));
      }

      // Remove the service configuration file from the system data directory
      if (fs.existsSync(path.join(systemPath, "rmservice.xml"))) {
        fs.unlinkSync(path.join(systemPath, "rmservice.xml"));
      }

      migrateDatabaseToUserLocation();

      console.log("Service uninstalled");
    }
  } catch (error: any) {
    console.error(error);
  }
}

async function startService() {
  if (!(await serviceInstalled())) {
    console.error("Service not installed");
    return;
  }

  try {
    const { systemPath } = dataPath();
    const mode = findDatabasePath() === path.join(systemPath, dbName) ? "boot" : "login";

    if (mode === "boot") {
      // Check if service is already installed
      const { stderr, stdout } = await execPromise(`"${path.join(systemPath, "rmservice.exe")}" status`);

      if (stderr) {
        console.error(stderr);
        return;
      }

      if (stdout.includes("NonExistent")) {
        console.log("Service not installed");
        return;
      } 
      
      if (stdout.includes("Started")) {
        console.log("Service already running");
        return;
      }

      // Call rmservice.exe start to start the service
      const { stderr: stderr2 } = await execPromise(`"${path.join(systemPath, "rmservice.exe")}" start`);

      if (stderr2) {
        console.error(stderr2);
        return;
      }

      console.log("Service started");
    } else {
      console.log("Starting user services on Windows is not supported. Please manually start the service using the \"start-monitoring\" command.");
    }
  } catch (error: any) {
    console.error(error);
  }
}

async function stopService() {
  if (!(await serviceInstalled())) {
    console.error("Service not installed");
    return;
  }

  try {
    const { systemPath } = dataPath();
    const mode = findDatabasePath() === path.join(systemPath, dbName) ? "boot" : "login";

    if (mode === "boot") {
      // Check if service is already installed
      const { stderr, stdout } = await execPromise(`"${path.join(systemPath, "rmservice.exe")}" status`);
        
      if (stderr) {
        console.error(stderr);
        return;
      }

      if (stdout.includes("NonExistent")) {
        console.log("Service not installed");
        return;
      } 
      
      if (stdout.includes("Stopped")) {
        console.log("Service already stopped");
        return;
      }

      // Call rmservice.exe stop to stop the service
      const { stderr: stderr2 } = await execPromise(`"${path.join(systemPath, "rmservice.exe")}" stop`);

      if (stderr2) {
        console.error(stderr2);
        return;
      }

      console.log("Service stopped");
    } else {
      console.log("Stopping user services on Windows is not supported. Please use Task Manager to kill the process.");
    }
  } catch (error: any) {
    console.error(error);
  }
}

export {
  installService,
  startService,
  stopService,
  uninstallService,
};