const os = require("node:os");

const macosModule = require("./macos/index.ts");
const linuxModule = require("./linux/index.ts");
const windowsModule = require("./windows/index.ts");

const platformModules:  Record<string, any> = {
  darwin: macosModule,
  linux: linuxModule,
  win32: windowsModule,
};

async function manageService(command: string, option = null) {
  const modulePath = platformModules[os.platform()]

  if (!modulePath) {
    console.error("Unsupported platform");
    return;
  }
  
  const {
    installService,
    isRunning,
    serviceInstalled,
    startService,
    stopService,
    uninstallService,
  } = modulePath;

  const commands: Record<string, any> = {
    install: installService,
    installed: serviceInstalled,
    running: isRunning,
    start: startService,
    stop: stopService,
    uninstall: uninstallService,
  };

  const serviceCommand = commands[command];

  if (!serviceCommand) {
    console.error("Unsupported command");
    return;
  }

  return serviceCommand(option);
}

module.exports = { manageService };
