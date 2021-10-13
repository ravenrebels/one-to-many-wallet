const admin = require("firebase-admin");
const rvnConfig = require("./rvnConfig.json");
const getRPC = require("./getRPC");
const firebaseConfig = require("../firebaseConfig.json");

const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: firebaseConfig.databaseURL,
});

const rpc = getRPC(rvnConfig);

//Read all users
//Check that each user has an array of Ravencoin addresses

async function assignRavencoinAddresses(userUID) {
  const newAddress = await rpc("getnewaddress", []);
  const ravencoinAddresses = await admin
    .database()
    .ref("users/" + userUID + "/ravencoinAddresses");
  var newPostRef = ravencoinAddresses.push();
  await newPostRef.set({
    address: newAddress,
  });
}
async function work() {
  function verifyUser(snapshot) {
    if (snapshot.exists() === true) {
      const users = snapshot.val();
      const values = Object.values(users);
      for (const user of values) {
        if (!user.ravencoinAddresses) {
          console.log("Should assign address for", user.uid);
          assignRavencoinAddresses(user.uid);
        }

        console.log(user.displayName, user.uid, user.ravencoinAddresses);
      }
    }
  }
  admin.database().ref("users/").on("value", verifyUser);
}

work();
