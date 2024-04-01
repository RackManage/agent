const Monitor = require('ping-monitor');
const { openOrCreateDatabase, getServers } = require("../db");
const { updateStatus } = require("../firebase/realtime");

async function pingServer(server) {
  let config = {
    address: server.server,
    interval: server.interval,
    protocol: server.mode,
    ignoreSSL: true,
  }

  if (server.port) {
    config.port = server.port;
  }

  let monitor = new Monitor(config);

  monitor.on('up', function (res, state) {
    updateStatus({
      id: server.id,
      name: server.name,
      server: server.server,
      port: server.port,
      mode: server.mode,
      status: 'up',
    });
    console.log(`${state.address} is up at ${new Date()}`);
  });

  monitor.on('down', function (res, state) {
    updateStatus({
      id: server.id,
      name: server.name,
      server: server.server,
      port: server.port,
      mode: server.mode,
      status: 'down',
    });
    console.log(`${state.address} is down at ${new Date()}`);
  });

  monitor.on('restored', function (res, state) {
    updateStatus({
      id: server.id,
      name: server.name,
      server: server.server,
      port: server.port,
      mode: server.mode,
      status: 'up',
    });
    console.log(`${state.address} is back up at ${new Date()}`);
  });

  monitor.on('timeout', function (error, res) {
    updateStatus({
      id: server.id,
      name: server.name,
      server: server.server,
      port: server.port,
      mode: server.mode,
      status: 'timeout',
    });
    console.log(`${res.address} has timed out at ${new Date()}`);
  });

  monitor.on('error', function (error) {
    updateStatus({
      id: server.id,
      name: server.name,
      server: server.server,
      port: server.port,
      mode: server.mode,
      status: error.code,
    });

    console.log(`${server.server} encountered error ${error.code} at ${new Date()}`);
  });
}

async function startMonitoring() {
  let db = await openOrCreateDatabase();
  let servers = await getServers(db);

  servers.forEach((server) => {
    pingServer(server);
  });
}

module.exports = {
  startMonitoring,
};
