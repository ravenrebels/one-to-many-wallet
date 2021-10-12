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
  console.log("Requests", requests);
  if (!requests) {
    return (
      <h1 className="glass padding-default">
        You do not have any transactions yet
      </h1>
    );
  } 
  requests.sort(function (a, b) {
    if(!a.date){
      return -1;
    }
    if(a.date === b.date){
      return 0;
    }
    if(a.date < b.date){
      return 1;
    }
    return -1;
  });
  return (
    <div className="padding-default">
      <div className="padding-default glass">
        <h1>Sent</h1>
        <div>
          {requests.map(function (request, index) {
            console.log("index", index);
            return (
              <div
                key={index}
                className="glass padding-default"
                style={{ marginBottom: "10px" }}
              >
                <div>
                  {request.amount} {request.asset}<br/>
                  {request.date && new Date(request.date).toLocaleString()}
                </div>

                <div style={{overflow: "hidden",textOverflow:"ellipsis"}}>{request.transactionId}</div>
                <div>{request.error && request.error.message}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
