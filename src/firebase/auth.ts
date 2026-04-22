/*
 * Broker-backed Firebase authentication helpers.
 * The CLI keeps a device private key in the OS keychain and exchanges
 * signed broker requests for short-lived Firebase custom tokens.
 */

const {
  signInWithCustomToken,
  signOut,
} = require("firebase/auth");

import { clearBrokerConfig, enrollWithBroker, fetchBrokerCustomToken, getBrokerConfig } from "./broker"
import { auth } from "./firebase-config"

async function loginWithToken(token: string, db: any, options: {
  brokerUrl: string,
  deviceName?: string,
}) {
  try {
    const enrollment = await enrollWithBroker(db, {
      brokerUrl: options.brokerUrl,
      deviceName: options.deviceName,
      enrollmentToken: token,
    });

    await signInWithCustomToken(auth, enrollment.firebaseCustomToken);
    return true;
  } catch (error) {
    console.error(
      "\nError enrolling device:",
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

async function ensureFirebaseSession(db: any, printWarning = true) {
  const brokerConfig = await getBrokerConfig(db);
  if (!brokerConfig) {
    printWarning &&
      console.error(
        "No broker enrollment found. Please run `rackmanage login` to connect this device."
      );
    return false;
  }

  if (auth.currentUser) {
    try {
      await auth.currentUser.getIdToken();
      return true;
    } catch {}
  }

  try {
    const session = await fetchBrokerCustomToken(db);
    await signInWithCustomToken(auth, session.firebaseCustomToken);
    return true;
  } catch (error) {
    printWarning &&
      console.error(
        "Error authenticating with broker:",
        error instanceof Error ? error.message : error
      );
    return false;
  }
}

async function logout(db: any) {
  await signOut(auth).catch(() => {});
  await clearBrokerConfig(db);
  console.log("Successfully logged out");
}

async function checkAndRefreshToken(db: any, printWarning = true) {
  return ensureFirebaseSession(db, printWarning);
}

export {
  checkAndRefreshToken,
  ensureFirebaseSession,
  loginWithToken,
  logout,
};
