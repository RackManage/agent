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

async function installService(root: string, mode: string) {
  try {
    (mode === "login") ?
      await install({
        loadCommands: [
          {
            command: `launchctl unload ${path.join(userServicePath(), "io.rackmanage.agent.plist")}`,
            ignoreErrors: true,
          },
          {
            command: `launchctl load ${path.join(userServicePath(), "io.rackmanage.agent.plist")}`,
            ignoreErrors: false,
          }
        ],
        mode,
        root,
        serviceFileName: "io.rackmanage.agent.plist",
        serviceTemplate: path.join(__dirname, "io.rackmanage.agent.plist.tpl"),
      })
    :
      await install({
        loadCommands: [
          {
            command: `sudo launchctl unload ${path.join(systemServicePath(), "io.rackmanage.agent.plist")}`,
            ignoreErrors: true,
          },
          {
            command: `sudo launchctl load ${path.join(systemServicePath(), "io.rackmanage.agent.plist")}`,
            ignoreErrors: false,
          }
        ],
        mode,
        root,
        serviceFileName: "io.rackmanage.agent.plist",
        serviceTemplate: path.join(__dirname, "io.rackmanage.agent.plist.tpl"),
      });
  } catch (error: any) {
    console.error(error);
  }
}

async function uninstallService() {
  try {
    await uninstall(
      "io.rackmanage.agent.plist",
      [
        {
          command: `launchctl stop io.rackmanage.agent`,
          ignoreErrors: true,
        },
        {
          command: `launchctl unload ${path.join(userServicePath(), "io.rackmanage.agent.plist")}`,
          ignoreErrors: false,
        }
      ],
      [
        {
          command: `sudo launchctl stop io.rackmanage.agent`,
          ignoreErrors: true,
        },
        {
          command: `sudo launchctl unload ${path.join(systemServicePath(), "io.rackmanage.agent.plist")}`,
          ignoreErrors: false,
        }
      ]
    )
  } catch (error: any) {
    console.error(error);
  }
}

async function startService() {
  try {
    await runCommands(
      [{
        command: "launchctl start io.rackmanage.agent",
        ignoreErrors: false,
      }],
      [{
        command: "sudo launchctl start io.rackmanage.agent",
        ignoreErrors: false,
      }]
    )
    
    console.log("Service started successfully");
  } catch (error: any) {
    console.error("Failed to start service:", error);
  }
}

async function stopService() {
  try {
    await runCommands(
      [{
        command: "launchctl stop io.rackmanage.agent",
        ignoreErrors: false,
      }],
      [{
        command: "sudo launchctl stop io.rackmanage.agent",
        ignoreErrors: false,
      }]
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
