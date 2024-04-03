async function startAgent() {
  const { subscribeToCommands } = require("../firebase/realtime");
  subscribeToCommands();

  const { startMonitoring } = require("../monitor");
  startMonitoring();  
}

module.exports = {
  startAgent,
};