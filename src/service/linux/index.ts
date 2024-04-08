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
            command: `systemctl --user enable rmagent.service`,
            ignoreErrors: false,
          },
          {
            command: `systemctl --user start rmagent.service`,
            ignoreErrors: false,
          }
        ],
        mode,
        root,
        serviceFileName: "rmagent.service",
        serviceTemplate: path.join(__dirname, "rmagent-user.service.tpl"),
      })
    :
      await install({
        loadCommands: [
          {
            command: `sudo systemctl daemon-reload`,
            ignoreErrors: true,
          },
          {
            command: `sudo systemctl enable rmagent.service`,
            ignoreErrors: false,
          },
          {
            command: `sudo systemctl start rmagent.service`,
            ignoreErrors: false,
          }
        ],
        mode,
        root,
        serviceFileName: "rmagent.service",
        serviceTemplate: path.join(__dirname, "rmagent-system.service.tpl"),
      });
  } catch (error: any) {
    console.error(error);
  }
}

async function uninstallService() {
  try {
    await uninstall(
      "rmagent.service",
      [
        {
          command: `systemctl --user stop rmagent.service`,
          ignoreErrors: true,
        },
        {
          command: `systemctl --user disable rmagent.service`,
          ignoreErrors: false,
        },
        {
          command: `systemctl --user daemon-reload`,
          ignoreErrors: false,
        }
      ],
      [
        {
          command: `sudo systemctl stop rmagent.service`,
          ignoreErrors: true,
        },
        {
          command: `sudo systemctl disable rmagent.service`,
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
        command: "systemctl --user start rmagent.service",
        ignoreErrors: false,
      }],
      [{
        command: "sudo systemctl start rmagent.service",
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
        command: "systemctl --user stop rmagent.service",
        ignoreErrors: false,
      }],
      [{
        command: "sudo systemctl stop rmagent.service",
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