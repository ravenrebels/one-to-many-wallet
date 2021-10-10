const getRPC = require("./getRPC");
const rvnConfig = require("./rvnConfig.json");

const rpc = getRPC(rvnConfig);

async function getReceivedByAddress(address, includeAllTransactions) {
  const minConfirmations = 0;
  const maxConfirmations = 1000;
  const obj = await rpc("listreceivedbyaddress", [minConfirmations]);
  const values = Object.values(obj);
  const thisAddress = values.filter(
    (addressObject) => addressObject.address === address
  );
  console.log(thisAddress);
  const transactionsList = thisAddress[0].txids;
  const transactions = {};
  for (const id of transactionsList) {
    const t = await rpc("gettransaction", [id]);
    delete t.hex;
    //Happy flow, do not include transactions with more than 'maxConfirmations' confirmations
    if (t.confirmations < maxConfirmations) {
      transactions[id] = t;
    }

    //OK, we intend to include every transactions
    if (includeAllTransactions) {
      transactions[id] = t;
    }
  }
  return transactions;
}

module.exports = getReceivedByAddress;
