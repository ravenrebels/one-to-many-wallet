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

// DATA MODEL: requests/$userid/requestid
admin
  .database()
  .ref("requests/")
  .on("value", function (snapshot) {
    if (snapshot.exists() === true) {
      const data = snapshot.val();
      const users = Object.keys(data);

      for (const userKey of users) {
        //Check that all requests have been handle, that is payments

        const userRequests = data[userKey];

        if (!userRequests) {
          continue;
        }
        const requestKeys = Object.keys(userRequests);

        requestKeys.map(function (reqKey) {
          const request = userRequests[reqKey];

          //Do not process requests with transactionId
          if (request.transactionId) {
            return null;
          }
          if (request.error) {
            return null;
          }

          console.log("Will pay", reqKey);

          //Fetch the users address
          admin
            .database()
            .ref("/users/" + userKey)
            .once("value", (userDataRaw) => {
              const userData = userDataRaw.val();
              const addresses = Object.values(userData.ravencoinAddresses);
              const address = addresses[0].address;

              const requestReference = admin
                .database()
                .ref("requests/" + userKey + "/" + reqKey);

              transfer(request, requestReference, address);
            });
        });
      }
    }
  });

function transfer(request, requestReference, fromAddress) {
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

  //Get address for user
  const ASSET_NAME = request.asset;
  const FROM_ADDRESS = fromAddress; //Object.values(user.ravencoinAddresses)[0].address;
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

  console.log("Will pay", args);

  const promise = rpc("transferfromaddress", args);

  promise.then(function (transactionIdArray) {
    const transactionId = transactionIdArray[0];
    const obj = {
      date: new Date(),
      transactionId,
    };
    admin.database().ref(requestReference).update(obj);
  });
  promise.catch(function (e) {
    const obj = {
      date: new Date(),
      error: e.data.error,
    };
    admin.database().ref(requestReference).update(obj);
  });
}
