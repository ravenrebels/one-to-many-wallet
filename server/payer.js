const admin = require("firebase-admin");
const getRPC = require("./getRPC");
const rvnConfig = require("./rvnConfig.json");
const serviceAccount = require("./serviceAccount.json");
import firebaseConfig from "../firebaseConfig.json";
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: firebaseConfig.databaseURL,
});

const rpc = getRPC(rvnConfig);

//Read all users
//Check that each user has an array of Ravencoin addresses

admin.database().ref("users/").on("value"),
  function (snapshot) {
    if (snapshot.exists() === true) {
      const users = snapshot.val();
      const values = Object.values(users);
      for (const user of values) {
        if (!user.ravencoinAddresses) {
          await assignRavencoinAddresses(user.uid);
        }

        //Check balance of address
        //listassetbalancesbyaddress "myaddress"
      }
    }
  };

//Set balance on all addresses

//Listen for requests
admin
  .database()
  .ref("users/")
  .on("child_added", function (snapshot) {
    console.log("CHILD ADDED");
    console.log(snapshot.val());
  });
