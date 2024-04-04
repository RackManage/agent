async function startAgent() {
  const { subscribeToCommands } = require("../firebase/realtime.ts");
  subscribeToCommands();

  const { startMonitoring } = require("../monitor/index.ts");
  startMonitoring();  
}

export {
  startAgent,
};