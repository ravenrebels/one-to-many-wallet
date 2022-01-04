const fs = require("fs");
const lockFileName = "./update.lock";
//Check if lock file exists
//A Ravencoin wallet might trigger hundreds of events at "once", we only want to run once.
try {
  if (fs.existsSync(lockFileName) === true) {
    console.log("Exit because of lock file");
    process.exit(1);
  }
  fs.writeFileSync(lockFileName, "" + new Date().getTime());
} catch (e) {
  console.error(e);
}

const admin = require("firebase-admin");
const getRPC = require("./getRPC");
const rvnConfig = require("./rvnConfig.json");
const serviceAccount = require("./serviceAccount.json");
const getReceivedByAddress = require("./getReceivedByAddress");
const firebaseConfig = require("../firebaseConfig.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: firebaseConfig.databaseURL,
});

const rpc = getRPC(rvnConfig);

async function processAddressesByUser(user) {
  if (user.ravencoinAddresses) {
    const assetBalances = [];

    for (const addressKey of Object.keys(user.ravencoinAddresses)) {
      const addressObject = user.ravencoinAddresses[addressKey];
      const address = addressObject.address;
      try {
        const balance = await rpc("listassetbalancesbyaddress", [address]);
        for (const assetName of Object.keys(balance)) {
          const data = await rpc("getassetdata", [assetName]);
          const num = balance[assetName];
          const obj = {
            name: assetName,
            balance: num,
            ipfs_hash: data.ipfs_hash || null,
          };
          assetBalances.push(obj);
        }
        const transactions = await getReceivedByAddress(address);

        await admin
          .database()
          .ref("transactions/" + user.uid)
          .update(transactions);
      } catch (e) {
        console.log("Error processing user/addresses", user.uid, e);
      }
    }

    const ref = admin.database().ref("assetbalances/" + user.uid);
    await ref.set(assetBalances);
  }
  console.log(user.displayName, user.uid, user.ravencoinAddresses);
}
async function work() {
  async function verifyUser(snapshot) {
    if (snapshot.exists() === true) {
      const users = snapshot.val();
      const values = Object.values(users);

      for (const u of values) {
        await processAddressesByUser(u);
      }
    }
  }

  admin.database().ref("users/").once("value", verifyUser);

  const timeToLive = 10000;
  const func = function () {
    fs.unlink(lockFileName, function () {});
    process.exit(1);
  };
  setTimeout(func, timeToLive);
}
work();
