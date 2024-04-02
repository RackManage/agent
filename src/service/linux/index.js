const {
  install,
  uninstall,
  runCommands,
} = require("../helpers/unix");
const path = require("path");

async function installService(mode) {
  try {
    if (mode === "login") {
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
    } else {
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
    }
  } catch (err) {
    console.error(err);
  }
}

async function uninstallService() {
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
  } catch (err) {
    console.error(err);
  }
}

async function startService() {
  try {
    await runCommands(
      ["systemctl --user start rmagent.service"],
      ["sudo systemctl start rmagent.service"]
    )
    
    console.log("Service started successfully");
  } catch (err) {
    console.error("Failed to start service:", err);
  }
}

async function stopService() {
  try {
    await runCommands(
      ["systemctl --user stop rmagent.service"],
      ["sudo systemctl stop rmagent.service"]
    )

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