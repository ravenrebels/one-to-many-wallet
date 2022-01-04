import React from "react";

import { Routes } from "./Routes";
import { Home } from "./Home";
import { Pay } from "./Pay";

import { hasPendingTransactions, Transactions } from "./Transactions";
import firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";

import settings from "../../settings.json";

export type User = firebase.User;

export default function App({ firebase, user, logOut }) {
  const [route, setRoute] = React.useState(Routes.OVERVIEW);
  const [assets, setAssets] = React.useState([]);
  const [receiveAddress, setReceiveAddress] = React.useState("");
  const [transactions, setTransactions] = React.useState(null);
  const [requests, setRequests] = React.useState([]);

  const database = firebase.database();

  //One time, update user profile
  React.useEffect(() => {
    console.info("User id", user.uid);
    //Make sure we get a clean copy of the user object
    //that we can modifiy before saving to firebase
    const obj = JSON.parse(JSON.stringify(user.toJSON()));
    delete obj.stsTokenManager;

    firebase
      .database()
      .ref("/users/" + user.uid)
      .update(obj);
  }, []);

  //Listen to transactions
  React.useEffect(() => {
    const ref = firebase.database().ref("transactions/" + user.uid);

    ref.on("value", (snapshot) => {
      const data = snapshot.val(); 
      setTransactions(data);
    });
  }, []);
  //Listen to requests
  React.useEffect(() => {
    const ref = firebase.database().ref("requests/" + user.uid);

    ref.on("value", (snapshot) => {
      const data = snapshot.val();
      setRequests(Object.values(data));
    });
  }, []);

  React.useEffect(() => {
    //Set Asset Balances
    //One user might have multiple addresses
    //Sum the balance of all addresses by asset
    const ref = firebase.database().ref("assetBalances/" + user.uid);
    ref.on("value", (snapshot) => {
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
    });
  }, []);
  React.useEffect(() => {
    const ref = firebase.database().ref("users/" + user.uid);
    ref.on("value", (snapshot) => {
      const userObj = snapshot.val();

      //Set receive address
      if (userObj.ravencoinAddresses) {
        setReceiveAddress(
          Object.values(userObj.ravencoinAddresses)[0]["address"]
        );
      }
    });

    const unregisterEventListener = function () {
      ref.off("value");
    };
    return unregisterEventListener;
  }, []);

  return (
    <div>
      <Navigator
        setRoute={setRoute}
        transactions={transactions}
        logOut={logOut}
      />
      {route === Routes.TRANSACTIONS && (
        <Transactions
          transactions={transactions}
          requests={requests}
        ></Transactions>
      )}
      {route === Routes.OVERVIEW && <Home user={user} assets={assets} />}
      {route === Routes.PAY && (
        <Pay
          assets={assets}
          database={database}
          okCallback={(transactionData) => {
            setRoute(Routes.TRANSACTIONS);
          }}
          receiveAddress={receiveAddress}
          user={user}
        />
      )}
      <div style={{ clear: "both" }}></div>
    </div>
  );
}

function Navigator({ setRoute, transactions, logOut }) {
  return (
    <ul className="padding-default raven-rebels-multi-wallet__nav">
      <li className="raven-rebels-multi-wallet__nav-item">
        <button
          className="unstyled-button"
          onClick={() => setRoute(Routes.OVERVIEW)}
        >
          <i className="fa fa-home fa-2x" title="Home"></i>
        </button>
      </li>
      <li className="raven-rebels-multi-wallet__nav-item">
        <button
          className="unstyled-button"
          onClick={() => setRoute(Routes.PAY)}
        >
          <i className="fa fa-exchange-alt fa-2x" title="Pay"></i>
        </button>
      </li>
      <li className="raven-rebels-multi-wallet__nav-item">
        <button
          className="unstyled-button"
          onClick={() => setRoute(Routes.TRANSACTIONS)}
        >
          <i className="fas fa-list fa-2x" title="Transactions"></i>
        </button>

        {hasPendingTransactions(transactions) && (
          <div
            className="blink_me"
            style={{ position: "absolute", fontSize: "80%" }}
          >
            PENDING
          </div>
        )}
      </li>

      <li className="raven-rebels-multi-wallet__nav-item">
        <button className="unstyled-button" onClick={logOut}>
          <i className="fas fa-sign-out-alt fa-2x" title="Sign out"></i>
        </button>
      </li>
    </ul>
  );
}
