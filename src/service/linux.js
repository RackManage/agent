const os = require("os");
const path = require("path");
const fs = require("fs");
const util = require('util');
const { exec } = require("child_process");
const execPromise = util.promisify(exec);
const { dataPath, findDatabasePath, dbName } = require("../db/paths");

const systemServicePath = "/etc/systemd/system";
const userServicePath = path.join(os.homedir(), ".config/systemd/user");

async function installService(mode) {
  
  try {
    let serviceFilePath;
    let executableTargetPath;
    
    if (mode === "user") {
        let serviceData = fs.readFileSync(path.join(__dirname, "rmagent-user.service.tpl"));

        // Create the user data directory if it doesn't exist
        if (!fs.existsSync(userServicePath)) {
            fs.mkdirSync(userServicePath, { recursive: true });
        }

        // Copy the current executable to the user data directory
        executableTargetPath = path.join(userServicePath, "rmagent");
        fs.copyFileSync(process.argv[0], executableTargetPath);

        // Replace placeholders in the service file
        serviceData = serviceData.toString().replace(/{{DATA_DIR}}/g, userServicePath);

        // Write the service file to user systemd directory
        serviceFilePath = path.join(userServicePath, "rmagent.service");
        fs.writeFileSync(serviceFilePath, serviceData);

        // Reload user systemd daemon and enable the service
        await execPromise("systemctl --user daemon-reload");
        await execPromise(`systemctl --user enable rmagent.service`);
        await execPromise(`systemctl --user start rmagent.service`);

        console.log("Service installed");
    } else {
      // Make sure we're running as root
      if (os.userInfo().uid !== 0) {
        console.error("Please run this command as root");
        return;
      }

      let serviceData = fs.readFileSync(path.join(__dirname, "rmagent-system.service.tpl"));
      
      // Create the system data directory if it doesn't exist
      if (!fs.existsSync(systemServicePath)) {
        fs.mkdirSync(systemServicePath, { recursive: true });
      }

      // Copy the current executable to the system data directory
      executableTargetPath = path.join(systemServicePath, "rmagent");
      fs.copyFileSync(process.argv[0], executableTargetPath);
      
      // Replace placeholders in the service file
      serviceData = serviceData.toString().replace(/{{DATA_DIR}}/g, executableTargetPath);
      
      // Write the service file to systemd directory
      serviceFilePath = path.join(systemServicePath, "rmagent.service");
      fs.writeFileSync(serviceFilePath, serviceData);

      // Reload systemd daemon and enable the service
      await execPromise("sudo systemctl daemon-reload");
      await execPromise(`sudo systemctl enable rmagent.service`);
      await execPromise(`sudo systemctl start rmagent.service`);

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
      let { stdout } = await execPromise(`sudo systemctl list-units | grep rmagent.service`);
      if (stdout) {
        // Stop the service
        await execPromise(`sudo systemctl stop rmagent.service`);
        await execPromise(`sudo systemctl disable rmagent.service`);
        await execPromise(`sudo systemctl daemon-reload`);
      }

      // Remove the service file
      if (fs.existsSync(path.join(systemServicePath, "rmagent.service"))) {
        fs.unlinkSync(path.join(systemServicePath, "rmagent.service"));
      }

      // Remove the executable
      if (fs.existsSync(path.join(systemServicePath, "rmagent"))) {
        fs.unlinkSync(path.join(systemServicePath, "rmagent"));
      }
      
      console.log("Service uninstalled");
    } else {
      // Check if service is already loaded
      let { stdout } = await execPromise(`systemctl --user list-units | grep rmagent.service`);
      if (stdout) {
        // Unload the service
        await execPromise(`systemctl --user stop rmagent.service`);
        await execPromise(`systemctl --user disable rmagent.service`);
        await execPromise(`systemctl --user daemon-reload`);
      }

      // Remove the service file
      if (fs.existsSync(path.join(userServicePath, "rmagent.service"))) {
        fs.unlinkSync(path.join(userServicePath, "rmagent.service"));
      }

      // Remove the executable
      if (fs.existsSync(path.join(userServicePath, "rmagent"))) {
        fs.unlinkSync(path.join(userServicePath, "rmagent"));
      }

      console.log("Service uninstalled");
    }
  } catch (err) {
    console.error(err);
  }
}

async function startService() {
  try {
    let { systemPath } = dataPath();
    let mode = findDatabasePath() === path.join(systemPath, dbName) ? "system" : "user";

    if (mode === "system") {
      // Make sure we're running as root
      if (os.userInfo().uid !== 0) {
        console.error("Please run this command as root to start a system service");
        return;
      }
      await execPromise(`sudo systemctl start rmagent.service`);
    } else {
      await execPromise(`systemctl --user start rmagent.service`);
    }
    
    console.log("Service started successfully");
  } catch (err) {
    console.error("Failed to start service:", err);
  }
}

async function stopService() {
  try {
    let { systemPath } = dataPath();
    let mode = findDatabasePath() === path.join(systemPath, dbName) ? "system" : "user";

    if (mode === "system") {
      // Make sure we're running as root
      if (os.userInfo().uid !== 0) {
        console.error("Please run this command as root to stop a system service");
        return;
      }
      await execPromise(`sudo systemctl stop rmagent.service`);
    } else {
      await execPromise(`systemctl --user stop rmagent.service`);
    }

    console.log("Service stopped successfully");
  } catch (err) {
    console.error("Failed to stop service:", err);
  }
}

module.exports = {
  installService,
  uninstallService,
  startService,
  stopService,
};