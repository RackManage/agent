const os = require("node:os");

import * as linuxModule from "./linux";
import * as macosModule from "./macos";
import * as windowsModule from "./windows";

const platformModules:  Record<string, any> = {
  darwin: macosModule,
  linux: linuxModule,
  win32: windowsModule,
};

async function manageService(command: string, option: any = null) {
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

export { manageService };
