import React from "react";
import Requests from "./Requests";
interface ITransaction {
  confirmations: number;
}

export function isPending(transaction: ITransaction) {
  return transaction.confirmations === 0;
}
export function hasPendingTransactions(transactions: ITransaction) {
  if (!transactions) {
    return false;
  }

  const values: ITransaction[] = Object.values(transactions);

  for (const transaction of values) {
    if (isPending(transaction)) {
      return true;
    }
  }
  return false;
}
export function Transactions({ requests, transactions }) {
  if (!transactions) {
    return (
      <h1 className="glass padding-default">
        You do not have any transactions yet
      </h1>
    );
  }

  const keys = Object.keys(transactions);
  const pending = hasPendingTransactions(transactions);
  //Sort transactions by date
  keys.sort(function (t1, t2) {
    const time1 = transactions[t1].time;
    const time2 = transactions[t2].time;

    if (time1 > time2) {
      return -1;
    }
    if (time1 < time2) {
      return 1;
    }

    return 0;
  });
  return (
    <div className="padding-default" data-has-pending-transactions={pending}>
      <Requests requests={requests} />
      <h1>Received transactions</h1>
      <div style={{ marginTop: "40px" }}>
        {keys.map(function (key) {
          const trans = transactions[key];

          const details = {
            amount: 0,
            assetName: "",
            category: "",
            destination: "",
          };

          if (trans.details) {
            (details.assetName = "RVN"), (details.amount = trans.amount);
            details.category = trans.details[0].category;
            details.destination = trans.details[0].address;
          } else if (trans.asset_details) {
            details.amount = trans.asset_details[0].amount;
            details.assetName = trans.asset_details[0].asset_name;
            details.category = trans.asset_details[0].category;
            details.destination = trans.asset_details[0].destination;
          }

          //const details =  trans.details || trans.asset_details[0];

          const date = new Date(trans.time * 1000);

          const send = details.category === "send";
          const amount = details.amount;
          const href = "https://rvn.cryptoscope.io/tx/?txid=" + key;
          const text =
            (send === true ? "Sent" : "Received") +
            ` ${amount} ${details.assetName}`;

          const styles = { padding: "10px", marginBottom: "22px" };

          return (
            <div className="glass" key={key} style={styles}>
              {isPending(trans) && <h2>Pending</h2>}
              <div style={{ fontWeight: "bold" }}>{date.toLocaleString()}</div>
              <div>{text}</div>
              <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
                To: {details.destination}
              </div>
              <div>
                Confirmations:
                {trans.confirmations > 20
                  ? "more than 20"
                  : trans.confirmations}
              </div>
              <a
                href={href}
                style={{
                  overflow: "hidden",
                  display: "inline-block",
                  maxWidth: "100%",
                }}
                target="transaction"
              >
                {key}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
