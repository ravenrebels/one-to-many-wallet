import React from "react";
import settings from "../../settings.json";
export function Home({ user, assets }) {
  const headers = [
    { text: "Asset name", align: "left", value: "link" },
    { text: "Balance", align: "right", value: "balance" },
  ];

  assets =
    assets &&
    assets.map(function (asset) {
      //https://cloudflare-ipfs.com/ipfs/QmSX9GJ3a3yRaL5FrXcpQXRoGVCuXWrymAiB7pxoPcQ9TB

      asset.link = asset.name;
      asset.ipfsURL =
        asset.ipfs_hash &&
        "https://cloudflare-ipfs.com/ipfs/" + asset.ipfs_hash;

      asset.image = asset.ipfsURL && (
        <div className="raven-rebels-multi-wallet__asset-image">
          <img
            onClick={() => window.open(asset.ipfsURL, "ipfs")}
            src={asset.ipfsURL}
          />
        </div>
      );

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
          <div className="padding-default glass raven-rebels-multi-wallet__home-asset" key={i.name}>
            <h3>{i.link}: {i.balance}</h3> 
            {i.image}
          </div>
        );
      })}
    </div>
  );
}
