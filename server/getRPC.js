const axios = require("axios");

function throwSyntaxError() {
  throw new Error(
    "Missing attributes config should contain rpcUsername, rpcPassword and rpcURL"
  );
}
function getRPC(config) {
  if (!config.rpcUsername) {
    throwSyntaxError();
  }
  if (!config.rpcPassword) {
    throwSyntaxError();
  }
  if (!config.rpcURL) {
    throwSyntaxError();
  }

  return async function rpc(method, params) {
    const promise = new Promise((resolutionFunc, rejectionFunc) => {
      const options = {
        auth: {
          username: config.rpcUsername,
          password: config.rpcPassword,
        },
      };
      const data = {
        jsonrpc: "1.0",
        id: "n/a",
        method,
        params,
      };

      try {
        const rpcResponse = axios.post(config.rpcURL, data, options);

        rpcResponse
          .then((re) => {
            const result = re.data.result;
            resolutionFunc(result);
          })
          .catch((e) => {
            console.log("FUCK UP catch", e);
            const { response } = e;
            const { request, ...errorObject } = response;
            rejectionFunc(errorObject);
          });
      } catch (e) {
        console.log("Less fuck up catch", e);
        rejectionFunc(e.response);
      }
    });
    return promise;
  };
}

module.exports = getRPC;
