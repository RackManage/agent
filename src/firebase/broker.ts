const keytar = require("keytar");
const crypto = require("node:crypto");
const os = require("node:os");
const packageVersion = require("../../package.json").version;

import { getConfigData, setConfigData } from "../db"

const authModeKey = "authMode";
const brokerUrlKey = "brokerUrl";
const deviceIdKey = "deviceId";
const deviceNameKey = "deviceName";
const agentUidKey = "agentUid";
const publicKeyFingerprintKey = "deviceKeyFingerprint";
const workspaceIdKey = "workspaceId";
const workspaceTypeKey = "workspaceType";
const keytarService = "rackmanage";

type BrokerConfig = {
  agentUid: null | string,
  brokerUrl: string,
  deviceId: string,
  deviceName: null | string,
  publicKeyFingerprint: null | string,
  workspaceId: null | string,
  workspaceType: null | string,
}

type BrokerEnrollment = {
  agentUid?: null | string,
  deviceId: string,
  deviceName?: null | string,
  firebaseCustomToken: string,
  teamId?: null | string,
  userId?: null | string,
  workspaceId?: null | string,
  workspaceType?: null | string,
}

type BrokerSession = {
  agentUid?: null | string,
  deviceName?: null | string,
  firebaseCustomToken: string,
  teamId?: null | string,
  userId?: null | string,
  workspaceId?: null | string,
  workspaceType?: null | string,
}

function normalizedWorkspace(enrollment: {
  teamId?: null | string,
  userId?: null | string,
  workspaceId?: null | string,
  workspaceType?: null | string,
}) {
  if (enrollment.workspaceId && enrollment.workspaceType) {
    return {
      workspaceId: enrollment.workspaceId,
      workspaceType: enrollment.workspaceType,
    };
  }

  if (enrollment.teamId) {
    return {
      workspaceId: enrollment.teamId,
      workspaceType: "team",
    };
  }

  if (enrollment.userId) {
    return {
      workspaceId: enrollment.userId,
      workspaceType: "user",
    };
  }

  return {
    workspaceId: null,
    workspaceType: null,
  };
}

function base64UrlEncode(value: Buffer | string) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
  return buffer.toString("base64url");
}

function keyAccount(deviceId: string) {
  return `device-auth:${deviceId}`;
}

function createDeviceFingerprint(publicKeyPem: string) {
  return crypto.createHash("sha256").update(publicKeyPem).digest("hex");
}

function createDeviceKeyPair() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519", {
    privateKeyEncoding: {
      format: "pem",
      type: "pkcs8",
    },
    publicKeyEncoding: {
      format: "pem",
      type: "spki",
    },
  });

  return {
    privateKeyPem: privateKey,
    publicKeyFingerprint: createDeviceFingerprint(publicKey),
    publicKeyPem: publicKey,
  };
}

function createProofPayload(deviceId: string, nonce: string, timestamp: number) {
  return [
    "rackmanage-device-broker-v1",
    deviceId,
    nonce,
    `${timestamp}`,
  ].join("\n");
}

async function postBrokerJson<T>(brokerUrl: string, pathname: string, body: unknown) {
  const url = new URL(pathname, `${normalizeBrokerUrl(brokerUrl)}/`);
  const response = await fetch(url, {
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(payload?.error || `Broker request failed with status ${response.status}`);
  }

  return payload as T;
}

async function storePrivateKey(deviceId: string, privateKeyPem: string) {
  await keytar.setPassword(keytarService, keyAccount(deviceId), privateKeyPem);
}

async function loadPrivateKey(deviceId: string) {
  return keytar.getPassword(keytarService, keyAccount(deviceId));
}

async function deletePrivateKey(deviceId: null | string) {
  if (!deviceId) {
    return;
  }

  await keytar.deletePassword(keytarService, keyAccount(deviceId));
}

function normalizeBrokerUrl(rawBrokerUrl: string) {
  const url = new URL(rawBrokerUrl.trim());
  return url.toString().replace(/\/$/, "");
}

async function getBrokerConfig(db: any): Promise<BrokerConfig | null> {
  const authMode = await getConfigData(db, authModeKey);
  if (authMode !== "broker") {
    return null;
  }

  const brokerUrl = await getConfigData(db, brokerUrlKey);
  const deviceId = (await getConfigData(db, deviceIdKey)) || (await getConfigData(db, "clientId"));
  if (!brokerUrl || !deviceId) {
    return null;
  }

  return {
    agentUid: await getConfigData(db, agentUidKey),
    brokerUrl,
    deviceId,
    deviceName: await getConfigData(db, deviceNameKey),
    publicKeyFingerprint: await getConfigData(db, publicKeyFingerprintKey),
    workspaceId: (await getConfigData(db, workspaceIdKey)) || (await getConfigData(db, "teamId")),
    workspaceType: (await getConfigData(db, workspaceTypeKey)) || ((await getConfigData(db, "teamId")) ? "team" : null),
  };
}

async function clearBrokerConfig(db: any) {
  const existingDeviceId = (await getConfigData(db, deviceIdKey)) || (await getConfigData(db, "clientId"));
  await deletePrivateKey(existingDeviceId);

  const keys = [
    agentUidKey,
    authModeKey,
    "clientId",
    brokerUrlKey,
    deviceIdKey,
    deviceNameKey,
    "email",
    publicKeyFingerprintKey,
    "refreshToken",
    "firebaseUserInstance",
    "teamId",
    workspaceIdKey,
    workspaceTypeKey,
  ];

  for (const key of keys) {
    // eslint-disable-next-line no-await-in-loop
    await setConfigData(db, key, null);
  }
}

async function enrollWithBroker(db: any, config: {
  brokerUrl: string,
  deviceName?: string,
  enrollmentToken: string,
}) {
  const existingDeviceId = (await getConfigData(db, deviceIdKey)) || (await getConfigData(db, "clientId"));
  const brokerUrl = normalizeBrokerUrl(config.brokerUrl);
  const deviceName = config.deviceName?.trim() || os.hostname();
  const provisionalDeviceId = crypto.randomUUID();
  const {
    privateKeyPem,
    publicKeyFingerprint,
    publicKeyPem,
  } = createDeviceKeyPair();

  const enrollment = await postBrokerJson<BrokerEnrollment>(brokerUrl, "/v1/broker/enroll", {
    deviceId: provisionalDeviceId,
    deviceName,
    enrollmentToken: config.enrollmentToken.trim(),
    metadata: {
      hostname: os.hostname(),
      platform: process.platform,
      version: packageVersion,
    },
    publicKeyFingerprint,
    publicKeyPem,
  });
  const workspace = normalizedWorkspace(enrollment);

  const enrolledDeviceId = enrollment.deviceId || provisionalDeviceId;
  await storePrivateKey(enrolledDeviceId, privateKeyPem);

  await setConfigData(db, authModeKey, "broker");
  await setConfigData(db, brokerUrlKey, brokerUrl);
  await setConfigData(db, deviceIdKey, enrolledDeviceId);
  await setConfigData(db, deviceNameKey, enrollment.deviceName || deviceName);
  await setConfigData(db, agentUidKey, enrollment.agentUid || `agent:${enrolledDeviceId}`);
  await setConfigData(db, publicKeyFingerprintKey, publicKeyFingerprint);
  await setConfigData(db, "clientId", enrolledDeviceId);
  await setConfigData(db, "email", null);
  await setConfigData(db, "firebaseUserInstance", null);
  await setConfigData(db, "refreshToken", null);
  await setConfigData(db, "teamId", workspace.workspaceType === "team" ? workspace.workspaceId : null);
  await setConfigData(db, workspaceIdKey, workspace.workspaceId);
  await setConfigData(db, workspaceTypeKey, workspace.workspaceType);

  if (existingDeviceId && existingDeviceId !== enrolledDeviceId) {
    await deletePrivateKey(existingDeviceId);
  }

  return {
    ...enrollment,
    deviceId: enrolledDeviceId,
    deviceName: enrollment.deviceName || deviceName,
  };
}

async function fetchBrokerCustomToken(db: any) {
  const config = await getBrokerConfig(db);
  if (!config) {
    throw new Error("No broker enrollment found. Please run `rackmanage login` again.");
  }

  const privateKeyPem = await loadPrivateKey(config.deviceId);
  if (!privateKeyPem) {
    throw new Error("Device private key is missing from the system keychain.");
  }

  const nonce = crypto.randomUUID();
  const timestamp = Date.now();
  const payload = createProofPayload(config.deviceId, nonce, timestamp);
  const signature = base64UrlEncode(
    crypto.sign(null, Buffer.from(payload), privateKeyPem)
  );

  const session = await postBrokerJson<BrokerSession>(config.brokerUrl, "/v1/broker/session", {
    deviceId: config.deviceId,
    keyFingerprint: config.publicKeyFingerprint,
    nonce,
    signature,
    timestamp,
  });
  const workspace = normalizedWorkspace(session);

  if (!session.firebaseCustomToken) {
    throw new Error("Broker response did not include a Firebase custom token.");
  }

  if (session.agentUid) {
    await setConfigData(db, agentUidKey, session.agentUid);
  }

  if (session.deviceName) {
    await setConfigData(db, deviceNameKey, session.deviceName);
  }

  await setConfigData(db, "teamId", workspace.workspaceType === "team" ? workspace.workspaceId : null);
  await setConfigData(db, workspaceIdKey, workspace.workspaceId);
  await setConfigData(db, workspaceTypeKey, workspace.workspaceType);

  return session;
}

export {
  clearBrokerConfig,
  enrollWithBroker,
  fetchBrokerCustomToken,
  getBrokerConfig,
  normalizeBrokerUrl,
};
