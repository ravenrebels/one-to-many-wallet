import React from "react";
import settings from "../../settings.json";
export function Home({ user, assets }) {
  const headers = [
    { text: "Asset name", align: "left", value: "link" },
    { text: "Balance", align: "right", value: "balance" },
  ];

  React.useEffect(() => {
    //Check if images has loaded

    assets.map(
      function (a) {
        if (!a.imageRef) {
          return null;
        }

        const target = a.imageRef.current; 
        target.addEventListener("error", function () {
          const iframe = document.createElement("iframe");
          iframe.style.width = "100%";
          iframe.style.height = "250px";
          iframe.setAttribute("frameborder", "0");
          // iframe.style.width = "100%";
          iframe.src = a.ipfsURL;
          target.parentNode.replaceChild(iframe, target);
        });
      },
      [assets]
    );
  });
  assets =
    assets &&
    assets.map(function (asset) {
      //https://cloudflare-ipfs.com/ipfs/QmSX9GJ3a3yRaL5FrXcpQXRoGVCuXWrymAiB7pxoPcQ9TB

      asset.link = asset.name;
      asset.ipfsURL =
        asset.ipfs_hash &&
        "https://cloudflare-ipfs.com/ipfs/" + asset.ipfs_hash;

      asset.image = null;
      if (asset.ipfsURL) {
        asset.imageRef = React.createRef();
        asset.image = (
          <div className="raven-rebels-multi-wallet__asset-image">
            <img
              ref={asset.imageRef}
              onClick={() => window.open(asset.ipfsURL, "ipfs")}
              src={asset.ipfsURL}
            />
          </div>
        );
      }

      if (asset.ipfsURL) {
        asset.link = (
          <a target="ipfs" href={asset.ipfsURL}>
            {asset.name}
          </a>
        );
      }
      return asset;
    });

  const items = assets || [];
  return (
    <div className="padding-default">
      <div className="glass raven-rebels-multi-wallet__home-heading padding-default">
        <h2>{settings.heading}</h2>
        <h5>{user.displayName}</h5>
      </div>
      {items.map(function (i) {
        return (
          <div
            className="padding-default glass raven-rebels-multi-wallet__home-asset"
            key={i.name}
          >
            <h3>
              {i.link}: {i.balance}
            </h3>
            {i.image}
          </div>
        );
      })}
    </div>
  );
}
