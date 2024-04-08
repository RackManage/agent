const Monitor = require('ping-monitor');

import { getServers, openOrCreateDatabase } from "../db"
import { updateStatus } from "../firebase/realtime"

async function pingServer(server: any) {
  const config = {
    address: server.server,
    ignoreSSL: true,
    interval: server.interval,
    port: undefined,
    protocol: server.mode,
  }

  if (server.port) {
    config.port = server.port;
  }

  const monitor = new Monitor(config);

  monitor.on('up', (_: any, state: any) => {
    updateStatus({
      id: server.id,
      mode: server.mode,
      name: server.name,
      port: server.port,
      server: server.server,
      status: 'up',
    });
    console.log(`${state.address} is up at ${new Date()}`);
  });

  monitor.on('down', (_: any, state: any) => {
    updateStatus({
      id: server.id,
      mode: server.mode,
      name: server.name,
      port: server.port,
      server: server.server,
      status: 'down',
    });
    console.log(`${state.address} is down at ${new Date()}`);
  });

  monitor.on('restored', (_: any, state: any) => {
    updateStatus({
      id: server.id,
      mode: server.mode,
      name: server.name,
      port: server.port,
      server: server.server,
      status: 'up',
    });
    console.log(`${state.address} is back up at ${new Date()}`);
  });

  monitor.on('timeout', (_: any, res: any) => {
    updateStatus({
      id: server.id,
      mode: server.mode,
      name: server.name,
      port: server.port,
      server: server.server,
      status: 'timeout',
    });
    console.log(`${res.address} has timed out at ${new Date()}`);
  });

  monitor.on('error', (error: any) => {
    updateStatus({
      id: server.id,
      mode: server.mode,
      name: server.name,
      port: server.port,
      server: server.server,
      status: error.code,
    });

    console.log(`${server.server} encountered error ${error.code} at ${new Date()}`);
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function startMonitoring() {
  const db = await openOrCreateDatabase();
  let servers: any = await getServers(db);

  while (servers && servers.length === 0) {
    console.log("No servers found. Sleeping for 5 minutes...");
    await sleep(1000 * 5 * 60);
    servers = await getServers(db);
  }

  for (const server of servers) {
    pingServer(server);
  }
}

export {
  startMonitoring,
};
