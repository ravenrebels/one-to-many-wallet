import React from "react";
import settings from "../../settings.json";

export default function useAssets(firebase, user) {
  const [assets, setAssets] = React.useState([]);
  React.useEffect(() => {
    //Set Asset Balances
    //One user might have multiple addresses
    //Sum the balance of all addresses by asset
    const assetsEventListener = (snapshot) => {
      const assetBalancesRaw = snapshot.val();
      if (!assetBalancesRaw) {
        return null;
      }
      const assetBalances = {};
      const assetsIPFS = {};
      const arr = Object.values(assetBalancesRaw);

      arr.map(function (assetBalanceItem: any) {
        console.log(assetBalanceItem);
        assetsIPFS[assetBalanceItem.name] = assetBalanceItem.ipfs_hash;
   
        if (!assets[assetBalanceItem.name]) {
          assetBalances[assetBalanceItem.name] = 0;
        }
        assetBalances[assetBalanceItem.name] += assetBalanceItem.balance;
      });

      let assetsArray = Object.keys(assetBalances).map((name) => {
        return {
          name,
          balance: assetBalances[name],
          ipfs_hash: assetsIPFS[name],
        };
      });

      //Sort assets alphabetically
      assetsArray = assetsArray.sort(function (a, b) {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name === b.name) {
          return 0;
        }
        return -1;
      });
      //Filter assets, if specified in settings.json
      if (settings.assetNames && settings.assetNames.length > 0) {
        assetsArray = assetsArray.filter(function (asset) {
          return settings.assetNames.includes(asset.name);
        });
      }
      setAssets(assetsArray);
    };

    const ref = firebase.database().ref("assetBalances/" + user.uid);
    const listener = ref.on("value", assetsEventListener);

    //Unregister the event listener
    const cleanUp = () => {
      ref.off("value", listener);
    };
    return cleanUp;
  }, []);

  return assets;
}
