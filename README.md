Companies that use digital tokens (Ravencoin assets) need a quick onramp.

This project enables organisations to setup a web wallet where customers/users can access tokens in seconds.
No personal Ravencoin wallet needed.

The user/customer can transfer tokens FROM this project TO their own Ravencoin wallet (Obviously) 


# DO NOT USE THIS CODE, NOT YET

#Setup Ravencoin wallet

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
