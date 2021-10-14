import React from "react";
import ReactDOM from "react-dom";
import { Routes } from "./Routes";
import { Home } from "./Home";
import { Pay } from "./Pay";

import { hasPendingTransactions, Transactions } from "./Transactions";
import firebase from "firebase";
import firebaseConfig from "../../firebaseConfig.json";
import settings from "../../settings.json";

export type User = firebase.User;
import { default as StyledFirebaseAuth } from "react-firebaseui/StyledFirebaseAuth";
const app = firebase.initializeApp(firebaseConfig);
const database = app.database();

const logOut = () => {
  if (confirm("Do you want to log out?")) {
    firebase.auth().signOut();
  }
};

function Cosmos() {
  const user = useUser();

  const uiConfig = {
    signInFlow: "popup",
    callbacks: {
      /* signInSuccessWithAuthResult: (authResult, _) => {
        // setUser(authResult.user);
        return true;
      },*/
      uiShown: function () { },
    },
    signInOptions: [
      // List of OAuth providers supported.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    ],
  };
  if (user) {
    return <App user={user} logOut={logOut} />;
  } else {
    return (
      <div style={{ marginTop: "50px", padding: "44px" }}>
        <h1>Wallet</h1>

        <StyledFirebaseAuth
          uiConfig={uiConfig}
          firebaseAuth={firebase.auth()}
        />
      </div>
    );
  }
}
function useUser(): User {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    firebase.auth().onAuthStateChanged(async function (user: User) {
      setUser(user);
    });
  }, []);
  return user;
}
function App({ user, logOut }) {
  const [route, setRoute] = React.useState(Routes.OVERVIEW);
  const [assets, setAssets] = React.useState([]);
  const [receiveAddress, setReceiveAddress] = React.useState("");
  const [transactions, setTransactions] = React.useState(null);
  const [requests, setRequests] = React.useState([]);

  React.useEffect(() => {
    firebase
      .database()
      .ref("/users/" + user.uid)
      .update(user.toJSON());
  }, []);

  //Listen to user
  React.useEffect(() => {
    const refString = "users/" + user.uid;
    const ref = firebase.database().ref(refString);

    ref.on("value", (snapshot) => {
      const userObj = snapshot.val();

      //Set requests
      if (userObj.request) {

        console.log("Requests", Object.values(userObj.requests));
        setRequests(Object.values(userObj.requests));
      }

      //Set set receive address
      if (userObj.ravencoinAddresses) {
        setReceiveAddress(Object.values(userObj.ravencoinAddresses)[0]["address"]);
      }

      //Set transactions
      setTransactions(userObj.transactions);

    });

    const unregisterEventListener = function () {
      ref.off("value");
    };
    return unregisterEventListener;
  }, []);



  React.useEffect(() => {
    //Listen to balance
    if (receiveAddress) {
      const refString = "users/" + user.uid + "/assetbalances";
      const ref = firebase.database().ref(refString);
      ref.on("value", (snapshot) => {
        //One user might have multiple addresses
        //Sum the balance of all addresses by asset
        const assetBalancesRaw = snapshot.val();
        if(!assetBalancesRaw){
          return null;
        }
        const assetBalances = {};
        const assetsIPFS = {};
        assetBalancesRaw.map(function (assetBalanceItem) {
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

        //Filter assets, if specified in settings.json
        if (settings.assetNames && settings.assetNames.length > 0) {
          assetsArray = assetsArray.filter(function (asset) {
            return settings.assetNames.includes(asset.name);
          });
        }
        setAssets(assetsArray);
      });

      const unregisterEventListener = function () {
        ref.off("value");
      };
      return unregisterEventListener;
    }
  }, [receiveAddress]);
  const style = {
    width: "200px",
    height: "200px",
    padding: "20px",
  };

  return (
    <div>
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
      <div style={{"clear": "both"}}></div>
    </div>
  );
}

ReactDOM.render(<Cosmos />, document.getElementById("app"));
