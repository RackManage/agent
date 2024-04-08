const path = require("node:path");

import {
  install,
  runCommands,
  uninstall,
} from "../helpers/unix"

async function installService(root: string, mode: string) {
  try {
    (mode === "login") ?
      await install(
        path.join(__dirname, "rmagent-user.service.tpl"),
        "rmagent.service",
        [
          "systemctl --user daemon-reload",
          "systemctl --user enable rmagent.service",
          "systemctl --user start rmagent.service"
        ],
        mode
      )
    :
      await install(
        path.join(__dirname, "rmagent-system.service.tpl"),
        "rmagent.service",
        [
          "sudo systemctl daemon-reload",
          "sudo systemctl enable rmagent.service",
          "sudo systemctl start rmagent.service"
        ],
        mode
      )
  } catch (error: any) {
    console.error(error);
  }
}

async function uninstallService(root: string) {
  try {
    await uninstall(
      "rmagent.service",
      [
        "systemctl --user stop rmagent.service || true",
        "systemctl --user disable rmagent.service",
        "systemctl --user daemon-reload"
      ],
      [
        "sudo systemctl stop rmagent.service || true",
        "sudo systemctl disable rmagent.service",
        "sudo systemctl daemon-reload"
      ], 
    )
  } catch (error: any) {
    console.error(error);
  }
}

async function startService(root: string) {
  try {
    await runCommands(
      ["systemctl --user start rmagent.service"],
      ["sudo systemctl start rmagent.service"]
    )
    
    console.log("Service started successfully");
  } catch (error: any) {
    console.error("Failed to start service:", error);
  }
}

async function stopService(root: string) {
  try {
    await runCommands(
      ["systemctl --user stop rmagent.service"],
      ["sudo systemctl stop rmagent.service"]
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