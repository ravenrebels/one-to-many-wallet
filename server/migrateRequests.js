const admin = require("firebase-admin");
const firebaseConfig = require("../firebaseConfig.json");
const serviceAccount = require("./serviceAccount.json");

/*
    Move Ravencoin address from 
    "users/" + userUID + "/ravencoinAddresses"
    to
    ravencoinAddresses/userid
*/
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: firebaseConfig.databaseURL,
});

async function work() {
  function migrate(snapshot) {
    if (snapshot.exists() === true) {
      const users = snapshot.val();
      const values = Object.values(users);
      for (const user of values) {
        if (user.transactions) {
          admin
            .database()
            .ref("transactions/" + user.uid)
            .update(user.transactions);
        }
        if (user.requests) {
          console.info(
            "Process",
            user.displayName,
            user.uid,
            user.ravencoinAddresses
          );

          admin
            .database()
            .ref("requests/" + user.uid)
            .update(user.requests);
        }

        if (user.assetbalances) {
          admin
            .database()
            .ref("assetBalances/" + user.uid)
            .set(user.assetbalances);
        }

        //Delete assetBalances, transactions and requests from the user object
        const toDelete = {
          assetbalances: null,
          requests: null,
          transactions: null,
          stsTokenManager: null,
        };

        //Now delete the old transactions
        admin
          .database()
          .ref("users/" + user.uid)
          .update(toDelete);
      }
    }
  }
  admin.database().ref("users/").once("value", migrate);
}

work();

//Close down after 20 seconds
setTimeout(function () {
  process.exit(0);
}, 20 * 1000);
