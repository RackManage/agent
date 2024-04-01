const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");

const firebaseConfig = {
  apiKey: "AIzaSyCsCzpR06sMBY8JMroIacQDmyI95Zo-E3A",
  authDomain: "auth.rackmanage.com",
  databaseURL: "https://rmagent.firebaseio.com",
  projectId: "rackmanage",
  appId: "1:60597853671:web:84556e8cd5b0908a937142",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

module.exports = {
  app,
  auth,
};