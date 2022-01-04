import React from "react";
import QRReader from "./QRReader";

export function Pay({ user, database, assets, receiveAddress, okCallback }) {
  const [to, setTo] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const defaultAsset = assets && assets.length > 0 && assets[0].name;
  const [asset, setAsset] = React.useState(defaultAsset);
  const [showQR, setShowQR] = React.useState(false);
  const startQRReader = React.createRef();

  const submit = async (_) => {
    if (isNaN(parseFloat(amount)) === true) {
      alert("Amount is not valid");
      return;
    }

    if (parseFloat(amount) > 0 === false) {
      alert("Amount must be more than zero");
      return;
    }

    if (!to || to.length < 10) {
      alert("To field does not seem like a valid Ravencoin address");
    }
    const str = `Are you sure you want to send\n${amount} ${asset} \nto\n ${to}?`;
    if (confirm(str)) {
      const requests = database.ref("/requests/" + user.uid);
      const newReq = requests.push();

      newReq.set({
        action: "send",
        to,
        amount,
        asset,
      });

      newReq.on("value", (snapshot) => {
        const data = snapshot.val();

        if (data.error) {
          const text = `
          ${data.error.message}. 
          Could not send ${data.amount} 
          of ${data.asset} 
          to ${data.to}`;
          alert(text);
        } else {
          //Only redirect when the request has gotten a txid

          if (data.transactionId && okCallback) {
            okCallback(data);
          }
        }
      });
      setTo("");
      setAmount("");
    }
  };
  const PAY = (
    <div>
      <button
        className="unstyled-button glass"
        style={{ padding: "10px", margin: "10px", marginBottom: "20px" }}
        onClick={() => setShowQR(true)}
      >
        Scan QR code
      </button>

      <div style={{ overflow: "hidden" }}>
        <div style={{ marginBottom: "22px" }}>
          <label>
            Token/Asset
            <br />
            <select
              className="padding-modest"
              style={{ fontSize: "16px", borderRadius: "5px" }}
              onChange={(event) => {
                setAsset(event.target.value);
              }}
            >
              {assets &&
                assets.map((asset) => {
                  return (
                    <option key={asset.name} value={asset.name}>
                      {asset.name} - {asset.balance}
                    </option>
                  );
                })}
            </select>
          </label>
        </div>
        <label>
          To address
          <input
            className="padding-modest"
            style={{
              borderRadius: "5px",
              display: "block",
              fontSize: "20px",
              width: "100%",
            }}
            value={to}
            onChange={(event) => {
              setTo(event.target.value.trim());
            }}
          ></input>
        </label>
      </div>
      <div style={{ marginTop: "10px" }}>
        <label>
          Amount
          <input
            className="padding-modest"
            style={{
              borderRadius: "5px",
              fontSize: "20px",
              display: "block",
            }}
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value.trim());
            }}
          ></input>
        </label>
      </div>
      <div
        style={{
          marginTop: "22px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <button
          className="unstyled-button glass"
          style={{ padding: "10px" }}
          onClick={submit}
        >
          Submit
        </button>
        <button
          className="unstyled-button glass"
          style={{ padding: "10px" }}
          onClick={() => {
            setTo("");
            setAmount("");
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );

  if (showQR == true) {
    const onClose = () => {
      setShowQR(false);
    };
    const onChange = (value: string) => {
      setTo(value);
    };
    return <QRReader onClose={onClose} onChange={onChange} />;
  }
  return (
    <div className="raven-rebels-multi-wallet__pay padding-default">
      <div
        className="glass padding-default"
        style={{ fontSize: "1.5rem", marginBottom: "44px" }}
      >
        This wallet is ASSET ONLY, do not send RVN to this wallet.
        <h2> Receive address</h2>{" "}
        <div style={{ fontSize: "60%", wordWrap: "break-word" }}>
          {receiveAddress}
        </div>
        <img
          style={{
            background: "white",
            borderRadius: "10px",
            marginTop: "10px",
          }}
          className="padding-modest"
          src={`https://api.qrserver.com/v1/create-qr-code/?color=000000&bgcolor=FFFFFF&data=raven:${receiveAddress}&qzone=1&margin=0&size=150x150&ecc=L`}
        />
      </div>

      <div className="glass padding-default">
        <h1>Pay / Transfer</h1>
        {PAY}
      </div>
    </div>
  );
}
