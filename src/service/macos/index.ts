const path = require("node:path");

import {
  systemServicePath,
  userServicePath,
} from "../helpers"
import {
  install,
  runCommands,
  uninstall,
} from "../helpers/unix"

async function installService(mode: string) {
  try {
    (mode === "login") ?
      await install(
          path.join(__dirname, "io.rackmanage.rmagent.plist.tpl"),
          "io.rackmanage.rmagent.plist",
          [
            `launchctl unload ${path.join(userServicePath(), "io.rackmanage.rmagent.plist")} || true`,
            `launchctl load ${path.join(userServicePath(), "io.rackmanage.rmagent.plist")}`
          ],
          mode
      )
    :
      await install(
          path.join(__dirname, "io.rackmanage.rmagent.plist.tpl"),
          "io.rackmanage.rmagent.plist",
          [
            `sudo launchctl unload ${path.join(systemServicePath(), "io.rackmanage.rmagent.plist")} || true`,
            `sudo launchctl load ${path.join(systemServicePath(), "io.rackmanage.rmagent.plist")}`
          ],
          mode
      );
  } catch (error: any) {
    console.error(error);
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
  } catch (error: any) {
    console.error(error);
  }
}

async function startService() {
  try {
    await runCommands(
      ["launchctl start io.rackmanage.rmagent"],
      ["sudo launchctl start io.rackmanage.rmagent"]
    )
    
    console.log("Service started successfully");
  } catch (error: any) {
    console.error("Failed to start service:", error);
  }
}

async function stopService() {
  try {
    await runCommands(
      ["launchctl stop io.rackmanage.rmagent"],
      ["sudo launchctl stop io.rackmanage.rmagent"]
    )
    
    console.log("Service started successfully");
  } catch (error: any) {
    console.error("Failed to start service:", error);
  }
}

export {
  installService,
  startService,
  stopService,
  uninstallService,
};
