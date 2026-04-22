const path = require("node:path");

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
            command: `systemctl --user daemon-reload`,
            ignoreErrors: true,
          },
          {
            command: `systemctl --user enable rackmanage.service`,
            ignoreErrors: false,
          },
          {
            command: `systemctl --user start rackmanage.service`,
            ignoreErrors: false,
          }
        ],
        mode,
        root,
        serviceFileName: "rackmanage.service",
        serviceTemplate: path.join(__dirname, "rackmanage-user.service.tpl"),
      })
    :
      await install({
        loadCommands: [
          {
            command: `sudo systemctl daemon-reload`,
            ignoreErrors: true,
          },
          {
            command: `sudo systemctl enable rackmanage.service`,
            ignoreErrors: false,
          },
          {
            command: `sudo systemctl start rackmanage.service`,
            ignoreErrors: false,
          }
        ],
        mode,
        root,
        serviceFileName: "rackmanage.service",
        serviceTemplate: path.join(__dirname, "rackmanage-system.service.tpl"),
      });
  } catch (error: any) {
    console.error(error);
  }
}

async function uninstallService() {
  try {
    await uninstall(
      "rackmanage.service",
      [
        {
          command: `systemctl --user stop rackmanage.service`,
          ignoreErrors: true,
        },
        {
          command: `systemctl --user disable rackmanage.service`,
          ignoreErrors: false,
        },
        {
          command: `systemctl --user daemon-reload`,
          ignoreErrors: false,
        }
      ],
      [
        {
          command: `sudo systemctl stop rackmanage.service`,
          ignoreErrors: true,
        },
        {
          command: `sudo systemctl disable rackmanage.service`,
          ignoreErrors: false,
        },
        {
          command: `sudo systemctl daemon-reload`,
          ignoreErrors: false,
        }
      ], 
    )
  } catch (error: any) {
    console.error(error);
  }
}

async function startService() {
  try {
    await runCommands(
      [{
        command: "systemctl --user start rackmanage.service",
        ignoreErrors: false,
      }],
      [{
        command: "sudo systemctl start rackmanage.service",
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
        command: "systemctl --user stop rackmanage.service",
        ignoreErrors: false,
      }],
      [{
        command: "sudo systemctl stop rackmanage.service",
        ignoreErrors: false,
      }]
    )

    console.log("Service stopped successfully");
  } catch (error: any) {
    console.error("Failed to stop service:", error);
  }
}

export {
  installService,
  startService,
  stopService,
  uninstallService,
};