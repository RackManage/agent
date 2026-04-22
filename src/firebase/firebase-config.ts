const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { getDatabase } = require("firebase/database");

export const firebaseConfig = {
  apiKey: "AIzaSyCsCzpR06sMBY8JMroIacQDmyI95Zo-E3A",
  authDomain: "auth.rackmanage.io",
  databaseURL: "https://rmagent.firebaseio.com",
  projectId: "rackmanage",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export {
  app,
  auth,
  db,
};