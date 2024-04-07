import { subscribeToCommands } from "../firebase/realtime";
import { startMonitoring } from "../monitor";

async function startAgent() {
  subscribeToCommands();
  startMonitoring();  
}

export {
  startAgent,
};