import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import React from "react";
import ReactDOM from "react-dom";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebaseConfig from "../../firebaseConfig.json";
import App from "./App";
import settings from "../../settings.json";

export type User = firebase.User;
const app = firebase.initializeApp(firebaseConfig);

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
      uiShown: function () {},
    },
    signInOptions: [
      // List of OAuth providers supported.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
  };
  if (user) {
    return <App firebase={firebase} user={user} logOut={logOut} />;
  } else {
    return (
      <div style={{ marginTop: "50px", padding: "44px" }}>
        <h2 style={{ marginTop: "50px", padding: "44px" }}>
          {settings.heading}
        </h2>

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

ReactDOM.render(<Cosmos />, document.getElementById("app"));
