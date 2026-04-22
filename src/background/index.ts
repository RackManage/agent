import { initAgent, subscribeToCommands } from "../firebase/realtime";
import { startMonitoring } from "../monitor";

async function startAgent() {
  await initAgent();
  await subscribeToCommands();
  await startMonitoring();
}

export {
  startAgent,
};
