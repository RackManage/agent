const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { getDatabase } = require("firebase/database");

const firebaseConfig = {
  apiKey: "AIzaSyCsCzpR06sMBY8JMroIacQDmyI95Zo-E3A",
  appId: "1:60597853671:web:84556e8cd5b0908a937142",
  authDomain: "auth.rackmanage.com",
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