const admin = require("firebase-admin");
const getRPC = require("./getRPC");
const rvnConfig = require("./rvnConfig.json");
const serviceAccount = require("./serviceAccount.json");
const firebaseConfig = require("../firebaseConfig.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: firebaseConfig.databaseURL,
});

const rpc = getRPC(rvnConfig);

//Read all users
//Check that each user has an array of Ravencoin addresses

admin
  .database()
  .ref("users/")
  .on("value", function (snapshot) {
    if (snapshot.exists() === true) {
      const users = snapshot.val();
      const values = Object.values(users);
      for (const user of values) {
        console.log("user", user.requests);
        //If user does not have an address, we cant do anything
        if (!user.ravencoinAddresses) {
          continue;
        }

        //Check that all requests have been handle, that is payments
        if (user.requests) {
          Object.keys(user.requests).map(function (reqKey) {
            console.log("request key", reqKey);
            const request = user.requests[reqKey];
            console.log("Got request", request);
            //Do not process requests with transactionId
            if (request.transactionId) {
              return null;
            }
            if (request.error) {
              return null;
            }

            const ASSET_NAME = request.asset;
            const FROM_ADDRESS = Object.values(user.ravencoinAddresses)[0]
              .address;
            const QTY = request.amount;
            const TO_ADDRESS = request.to;
            const MESSAGE = "";
            const EXPIRE_TIME = null;
            const RVN_CHANGE_ADDRESS = "";
            const ASSET_CHANGE_ADDRESS = FROM_ADDRESS;

            const args = [
              ASSET_NAME,
              FROM_ADDRESS,
              QTY,
              TO_ADDRESS,
              MESSAGE,
              EXPIRE_TIME,
              RVN_CHANGE_ADDRESS,
              ASSET_CHANGE_ADDRESS,
            ];

            const promise = rpc("transferfromaddress", args);

            promise.then(function (transactionIdArray) {
              const transactionId = transactionIdArray[0];
              const obj = {
                date: new Date(),
                transactionId,
              };
              admin
                .database()
                .ref("users/" + user.uid + "/requests/" + reqKey)
                .update(obj);
            });
            promise.catch(function (e) {
              const obj = {
                date: new Date(),
                error: e.data.error,
              };
              admin
                .database()
                .ref("users/" + user.uid + "/requests/" + reqKey)
                .update(obj);
            });

            /*
               transferfromaddress "asset_name" "from_address" qty "to_address" "message" expire_time "rvn_change_address" "asset_change_address"

                Transfer a quantity of an owned asset in a specific address to a given address
                Arguments:
                1. "asset_name"               (string, required) name of asset
                2. "from_address"             (string, required) address that the asset will be transferred from
                3. "qty"                      (numeric, required) number of assets you want to send to the address
                4. "to_address"               (string, required) address to send the asset to
                5. "message"                  (string, optional) Once RIP5 is voted in ipfs hash or txid hash to send along with the transfer
                6. "expire_time"              (numeric, optional) UTC timestamp of when the message expires
                7. "rvn_change_address"       (string, optional, default = "") the transaction RVN change will be sent to this address
                8. "asset_change_address"     (string, optional, default = "") the transaction Asset change will be sent to this address
              */
          });
        }
        //Check balance of address
        //listassetbalancesbyaddress "myaddress"
      }
    }
  });

//Set balance on all addresses
