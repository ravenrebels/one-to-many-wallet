const admin = require("firebase-admin"); 
const serviceAccount = require("./serviceAccount.json"); 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://multiwallet-55ad1-default-rtdb.europe-west1.firebasedatabase.app",
});
 
const defaultSettings = {
    assetNames: ["HOPIUM"]
}

async function work(){
    const dbRef = admin.database().ref("publicsettings");
    dbRef.get().then((snapshot) => {
      if (snapshot.exists() === false) {      
        dbRef.set(defaultSettings);
        console.info("Applying default settings", defaultSettings);
      }
      else{
          console.log("publicsettings exist", snapshot.val());
      }
    }).catch((error) => {
      console.error(error);
    }); 

    setTimeout(() => process.exit(1), 5000);
}
work();
