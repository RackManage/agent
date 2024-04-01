const os = require("os");

const windowsModule = require("./windows");
const macosModule = require("./macos");
const linuxModule = require("./linux");

const platformModules = {
  win32: windowsModule,
  darwin: macosModule,
  linux: linuxModule,
};

async function manageService(command, option = null) {
  const modulePath = platformModules[os.platform()];

  if (!modulePath) {
    console.error("Unsupported platform");
    return;
  }
  
  const {
    installService,
    uninstallService,
    startService,
    stopService,
    serviceInstalled,
    isRunning,
  } = modulePath;

  const commands = {
    install: installService,
    uninstall: uninstallService,
    start: startService,
    stop: stopService,
    installed: serviceInstalled,
    running: isRunning,
  };

  const serviceCommand = commands[command];

  if (!serviceCommand) {
    console.error("Unsupported command");
    return;
  }

  return await serviceCommand(option);
}

module.exports = { manageService };
