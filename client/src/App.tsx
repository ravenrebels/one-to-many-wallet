import React from "react";

import { Routes } from "./Routes";
import { Home } from "./Home";
import { Pay } from "./Pay";

import { hasPendingTransactions, Transactions } from "./Transactions";
import firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";

import useAssets from "./useAssets";

export type User = firebase.User;

export default function App({ firebase, user, logOut }) {
  const [route, setRoute] = React.useState(Routes.OVERVIEW);

  const [receiveAddress, setReceiveAddress] = React.useState("");
  const [transactions, setTransactions] = React.useState(null);
  const [requests, setRequests] = React.useState([]);

  const database = firebase.database();

  const assets = useAssets(firebase, user);

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
    const listener = ref.on("value", (snapshot) => {
      const data = snapshot.val();
      setTransactions(data);
    });
    //Return a clean up function
    return () => {
      ref.off("value", listener);
    };
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
