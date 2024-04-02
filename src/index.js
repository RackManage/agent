const { program } = require("commander");
const promptly = require("promptly");
const {
  openOrCreateDatabase,
  closeDb,
  getConfigData,
  addServer,
  getServers,
  getServer,
  addCredentials,
} = require("./db");

const {
  loginWithToken,
  logout,
  checkAndRefreshToken,
} = require("./firebase/auth");

const {
  name: packageName,
  version: packageVersion,
  description: packageDescription,
} = require("../package.json");

var Table = require("cli-table3");
const crypto = require("crypto");
const os = require("os");

program
  .name(packageName)
  .description(packageDescription)
  .version(packageVersion);

program
  .command("list")
  .description("List all servers monitored by Rack Manage")
  .action(async () => {
    let db = await openOrCreateDatabase();
    if (!(await checkAndRefreshToken(db))) return;

    let servers = await getServers(db);

    let table = new Table({
      head: ["Server", "Name", "Interval", "Port", "Mode"],
    });

    servers.forEach((server) => {
      table.push([
        server.server,
        server.name,
        server.interval,
        server.port,
        server.mode,
      ]);
    });

    console.log(table.toString());

    await closeDb(db);
  });

program
  .command("add")
  .description("Add a server to be monitored by Rack Manage")
  .requiredOption(
    "-s, --server <server>",
    "IP address or hostname of the server to add"
  )
  .option("-n, --name <name>", "Name of the server to add")
  .option("-i, --interval <interval>", "Monitoring interval in minutes", "5")
  .option("-p, --port <port>", "Port to monitor")
  .option("-m, --mode <mode>", "Monitoring mode (http, https, tcp, udp)", "tcp")
  .action(async (server) => {
    let db = await openOrCreateDatabase();
    if (!(await checkAndRefreshToken(db))) return;

    let serverId = crypto.randomUUID();

    let data = {
      id: serverId,
      server: server.server,
      name: server.name,
      interval: server.interval,
      port: server.port,
      mode: server.mode,
    };

    await addServer(db, data);

    await closeDb(db);

    console.log("Server added successfully.");
  });

program
  .command("login")
  .description("Connect agent to Rack Manage account")
  .argument("[token]", "The authentication token to set")
  .action(async (token) => {
    if (!token) {
      token = await promptly.prompt("Enter your Rack Manage agent token: ");
      token = token.trim();
    }

    console.log("\n");

    let db = await openOrCreateDatabase();
    let loginSuccess = await loginWithToken(token, db);

    if (!loginSuccess) {
      console.error("Error logging in. Please check your token and try again.");
      return;
    }

    await closeDb(db);
  });

program
  .command("logout")
  .description("Disconnect agent from Rack Manage account")
  .action(async () => {
    let db = await openOrCreateDatabase();
    if (!(await checkAndRefreshToken(db))) return;
    await logout();

    await closeDb(db);
  });

program
.command("ipmi", { hidden: true })
.description("Set the IPMI credentials for a server")
.option("-s, --server <server>", "The server to set the IPMI credentials for")
.option("-a, --address <address>", "The IPMI address")
.option("-u, --username <username>", "The IPMI username")
.action(async (options) => {
  let db = await openOrCreateDatabase();
  if (!(await checkAndRefreshToken(db))) return;

  let server;
  if (!options.server) {
    server = await promptly.prompt("Enter the server to set the IPMI credentials for: ");
  }

  let serverData = await getServer(db, options.server || server);

  if (!serverData) {
    console.error("Server not found.");
    await closeDb(db);
    return;
  }

  let ipmiAddress = options.address || (await promptly.prompt("Enter the IPMI address: "));
  let ipmiUsername = options.username || (await promptly.prompt("Enter the IPMI username: "));
  let ipmiPassword = await promptly.password("Enter the IPMI password: ");

  console.log("\n");

  const keytar = require("keytar");

  let serverId = crypto.randomUUID();
  let accountId = "rackmanage_" + crypto.randomUUID();

  await keytar.setPassword("rackmanage", accountId, ipmiPassword);

  let ipmiData = {
    id: serverId,
    server: server,
    address: ipmiAddress,
    username: ipmiUsername,
    credential: accountId,
  };

  await addCredentials(db, ipmiData);

  await closeDb(db);

  console.log("IPMI credentials added successfully.");
});

program
  .command("status")
  .description("Check the status of the agent")
  .action(async () => {
    let db = await openOrCreateDatabase();
    await checkAndRefreshToken(db, false);

    let data = {
      loggedIn: "False",
    };

    let token = await getConfigData(db, "refreshToken");
    if (token) {
      data.loggedIn = "True";
    }

    data.email = await getConfigData(db, "email");
    data.teamId = await getConfigData(db, "teamId");
    data.clientId = await getConfigData(db, "clientId");

    Object.keys(data).forEach((key) => {
      if (!data[key]) {
        data[key] = "Not set";
      }
    });

    let table = new Table({
      head: [
        "Logged In",
        "Email",
        "Team ID",
        "Client ID",
        "Agent Version",
        "Agent Status",
      ],
    });
    table.push([
      data.loggedIn,
      data.email,
      data.teamId,
      data.clientId,
      packageVersion,
      "Stopped",
    ]);

    console.log(table.toString());

    await closeDb(db);
  });

program
.command("start-monitoring", { hidden: true })
.option("-p, --path <path>", "Path to the database")
.action(async (options) => {
  let db = await openOrCreateDatabase((options && options.path) || undefined);
  if (!(await checkAndRefreshToken(db))) return;

  const { startMonitoring } = require("./service/ping");
  startMonitoring();

  await closeDb(db, (options && options.path) || undefined);
});

program
  .command("service")
  .description("Manage the Rack Manage agent service")
  .argument(
    "<action>",
    "The action to perform (start, stop, install, uninstall)"
  )
  .option(
    "-t, --trigger <trigger>",
    `When to trigger the service (login, boot). ${os.platform() === "win32" ? "Admin" : "Sudo"} permissions required for boot trigger.`
  )
  .option("-f, --force", "Force the action without confirmation")
  .action(async (action, options) => {
    let db = await openOrCreateDatabase();
    if (!(await checkAndRefreshToken(db))) return;
    await closeDb(db);

    const { manageService } = require("./service");

    if (action === "start") {
      await manageService("start");
    } else if (action === "stop") {
      await manageService("stop");
    } else if (action === "install") {
      let trigger = options.trigger;

      while (trigger !== "login" && trigger !== "boot") {
        console.log("");
        trigger = await promptly.prompt(
          "When to trigger the service (login, boot): "
        );
        trigger = trigger.trim();

        if (trigger !== "login" && trigger !== "boot") {
          console.error("Invalid option. Please enter 'login' or 'boot'.");
        }
      }

      if (trigger === "boot" && !options.force) {
        console.log(
          `\nNote: When installing the service to start at boot, you must run all future commands as ${os.platform() === "win32" ? "admin" : "sudo"}.`
        );
        let confirm = await promptly.confirm(
          "Are you sure you want to continue? (y/n): "
        );

        if (!confirm || confirm === "n") {
          console.log("\nInstallation cancelled.");
          return;
        }
      }

      console.log("");

      await manageService("install", trigger);
    } else if (action === "uninstall") {
      await manageService("uninstall");
    } else {
      program.error("Unsupported action.");
    }
  });

function errorColor(str) {
  return `\x1b[31m${str}\x1b[0m`;
}

program.configureOutput({
  writeOut: (str) => process.stdout.write(`${str}`),
  writeErr: (str) => process.stdout.write(`${str}`),
  outputError: (str, write) => write(errorColor(str)),
});

program.showHelpAfterError("(Add --help for additional information)");

program.parse(process.argv);
