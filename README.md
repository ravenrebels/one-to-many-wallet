Companies that use digital tokens (Ravencoin assets) need a quick onramp.

This project enables organisations to setup a web wallet where customers/users can access tokens in seconds.
No personal Ravencoin wallet needed.

The user/customer can transfer tokens FROM this project TO their own Ravencoin wallet (Obviously) 


# DO NOT USE THIS CODE, NOT YET

# Setup Ravencoin wallet

Go to https://ravencoin.org/wallet/ and download Ravencoin desktop wallet for your OS.
Configure you wallet to index assets and stuff
```server=1
whitelist=127.0.0.1
rpcallowip=127.0.0.1
txindex=1
addressindex=1
assetindex=1
timestampindex=1
spentindex=1 
rpcport=8766
dbcache=4096
# Username for JSON-RPC connections
rpcuser=SET_A_VERY_SECRET_USER_NAME
# Password for JSON-RPC connections
rpcpassword=SET_A_VERY_SECRET_PASSWORD
```
Notes: it can take a day or two to download and index the blockchain

# Google Firebase (middleware)
+ Create a project at Google Firebase
+ Realtime Database (create it)

## Configure Realtime database rules
You secure your project by applying rules
```
{
  "rules": {
    "users": {
      "$uid": {
        ".read": true,
        "$whatever": {
          ".write": "$uid === auth.uid",
          ".read": "$uid === auth.uid"
        },
        "ravencoinAddresses": {
          ".read": true,
          ".write": false
        }
      }
    },
    "transactions": {
      ".read": true
    },
    "assets": {
      ".read": true
    }
  }
}
```
## Build client
Change directory to ./client
Run command ```npm install``` to install dependencies
Run command ```npm start``` to start development server locally on https://localhost:1234
Run command ```npm run build``` to build web client for production, the files are "outputted" to ./dist

## Setup "server" part
The server part is the code that will be running on the same machine as your Ravencoin wallet.
Change directoty to ./server
Run command 

