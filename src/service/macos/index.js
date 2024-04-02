const path = require("path");
const {
  install,
  uninstall,
  runCommands,
} = require("../helpers/unix");

const {
  userServicePath,
  systemServicePath,
} = require("../helpers");

async function installService(mode) {
  try {
    if (mode == "login") {
      await install(
          path.join(__dirname, "io.rackmanage.rmagent.plist.tpl"),
          "io.rackmanage.rmagent.plist",
          [
            `launchctl unload ${path.join(userServicePath(), "io.rackmanage.rmagent.plist")} || true`,
            `launchctl load ${path.join(userServicePath(), "io.rackmanage.rmagent.plist")}`
          ],
          mode
      );
    } else {
      await install(
          path.join(__dirname, "io.rackmanage.rmagent.plist.tpl"),
          "io.rackmanage.rmagent.plist",
          [
            `sudo launchctl unload ${path.join(systemServicePath(), "io.rackmanage.rmagent.plist")} || true`,
            `sudo launchctl load ${path.join(systemServicePath(), "io.rackmanage.rmagent.plist")}`
          ],
          mode
      );
    }
  } catch (err) {
    console.error(err);
  }
}

async function uninstallService() {
  try {
    await uninstall(
      "io.rackmanage.rmagent.plist",
      [
        `launchctl stop io.rackmanage.rmagent || true`,
        `launchctl unload ${path.join(userServicePath(), "io.rackmanage.rmagent.plist")}`
      ],
      [
        `sudo launchctl stop io.rackmanage.rmagent || true`,
        `sudo launchctl unload ${path.join(systemServicePath(), "io.rackmanage.rmagent.plist")}`
      ]
    )
  } catch (err) {
    console.error(err);
  }
}

async function startService() {
  try {
    await runCommands(
      ["launchctl start io.rackmanage.rmagent"],
      ["sudo launchctl start io.rackmanage.rmagent"]
    )
    
    console.log("Service started successfully");
  } catch (err) {
    console.error("Failed to start service:", err);
  }
}

async function stopService() {
  try {
    await runCommands(
      ["launchctl stop io.rackmanage.rmagent"],
      ["sudo launchctl stop io.rackmanage.rmagent"]
    )
    
    console.log("Service started successfully");
  } catch (err) {
    console.error("Failed to start service:", err);
  }
}

module.exports = {
  installService,
  uninstallService,
  startService,
  stopService,
};
