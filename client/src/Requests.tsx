import React from "react";

interface Request {
  amount: number;
  asset: string;
  error: any;
  to: string;
  transactionId: string;
  date: string;
}
interface IProps {
  requests: Request[];
}
export default function Requests(props: IProps) {
  const requests = JSON.parse(JSON.stringify(props.requests));
  if (!requests) {
    return (
      <h1 className="glass padding-default">
        You do not have any transactions yet
      </h1>
    );
  }
  requests.sort(function (a, b) {
    if (!a.date) {
      return -1;
    }
    if (a.date === b.date) {
      return 0;
    }
    if (a.date < b.date) {
      return 1;
    }
    return -1;
  });
  return (
    <div className="padding-default glass">
      <div style={{ fontSize: "1.5rem", marginBottom: "44px" }}>
        <h2>Sent</h2>
      </div>
      <div>
        {requests.map(function (request, index) {
          return (
            <div
              key={index}
              className="glass padding-default"
              style={{ marginBottom: "10px" }}
            >
              {request.error && request.error.message && (
                <h3>Error: {request.error.message}</h3>
              )}
              <div>
                {request.amount} {request.asset}
                <br />
                {request.date && new Date(request.date).toLocaleString()}
              </div>
              <div>{request.to}</div>
              <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                <a
                  target="_blockexplorer"
                  href={
                    "https://rvn.cryptoscope.io/tx/?txid=" +
                    request.transactionId
                  }
                >
                  {request.transactionId}
                </a>
              </div>
              <div>{request.error && request.error.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
