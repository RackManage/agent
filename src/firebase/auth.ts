/*
 * This file contains functions for logging in and out of Firebase Auth.
 * It also contains a function to check and refresh the token.
 */

const {
  inMemoryPersistence,
  signInWithCustomToken,
  signOut,
  updateCurrentUser,
} = require("firebase/auth");
const jwt = require("jsonwebtoken");

import { getConfigData, openOrCreateDatabase, setConfigData } from "../db"
import { auth } from "./firebase-config"
import { deleteAgent, initAgent } from "./realtime"

async function loginWithToken(token: string, db: any) {
  // Decode token to get extra claims
  const decoded = jwt.decode(token);
  if (!decoded) {
    console.error("Invalid token. Please provide a valid agent token.");
    return false;
  }

  // Sign in with custom token
  return signInWithCustomToken(auth, token)
    .then(async (userCredential: any) => {
      const { user } = userCredential;

      // Save the team ID, client ID, refresh token, email, and user instance to the database
      await setConfigData(db, "teamId", decoded.claims.team);
      await setConfigData(db, "clientId", decoded.claims.clientId);
      await setConfigData(
        db,
        "refreshToken",
        user.stsTokenManager.expirationTime
      );
      await setConfigData(db, "email", user.email);
      await setConfigData(
        db,
        "firebaseUserInstance",
        JSON.stringify(auth.persistenceManager.persistence.storage)
      );

      // Initialize the agent
      await initAgent();

      console.log("Successfully logged in as", user.email);

      return true;
    })
    .catch(() => false);
}

async function logout() {
  const db = await openOrCreateDatabase();

  // Remove the agent from the database
  await deleteAgent();

  await signOut(auth)
    .then(() => {
      // Clear the database
      setConfigData(db, "teamId", null);
      setConfigData(db, "clientId", null);
      setConfigData(db, "refreshToken", null);
      setConfigData(db, "email", null);
      setConfigData(db, "firebaseUserInstance", null);

      console.log("Successfully logged out");
    })
    .catch((error: Error) => {
      console.log(error);
      console.error("Error logging out:", error);
    });
}

async function checkAndRefreshToken(db: any, printWarning = true) {
  // Check if a token exists
  const token = await getConfigData(db, "refreshToken");
  if (!token) {
    printWarning &&
      console.error(
        `No account connected. Please run \`rmagent login\` to login.`
      );
    return false;
  }

  // Check if a user instance exists
  let userInstance = await getConfigData(db, "firebaseUserInstance");
  if (!userInstance) {
    printWarning &&
      console.error("No user instance found. Please login again.");
    return false;
  }

  userInstance = JSON.parse(userInstance);

  // Load Firebase Auth with user instance from database
  await auth._initializeWithPersistence(inMemoryPersistence, null);
  auth.persistenceManager.persistence.storage = userInstance;
  await updateCurrentUser(auth, await auth.persistenceManager.getCurrentUser());

  // Refresh the token
  await auth.currentUser.getIdToken(true).catch((error: Error) => {
    console.error("Error refreshing token:", error);
    return false;
  });

  // Save the new token, expiration, and user instance
  await setConfigData(
    db,
    "refreshToken",
    auth.currentUser.stsTokenManager.expirationTime
  );
  await setConfigData(
    db,
    "expirationTime",
    auth.currentUser.stsTokenManager.expirationTime
  );
  await setConfigData(
    db,
    "firebaseUserInstance",
    JSON.stringify(auth.persistenceManager.persistence.storage)
  );

  await initAgent();

  return true;
}

export {
  checkAndRefreshToken,
  loginWithToken,
  logout,
};
