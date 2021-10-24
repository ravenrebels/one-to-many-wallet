import React from "react";

//@ts-ignore
var Html5QrcodeScanner = window.Html5QrcodeScanner;

interface IProps {
  onChange: (value: string) => void;
  onClose: () => void;
}
export default function QRReader({ onChange, onClose }: IProps) {
  React.useEffect(() => {
    let html5QrcodeScanner = new Html5QrcodeScanner(
      "reader",
      { fps: 4, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    function onScanSuccess(decodedText, decodedResult) {
      // handle the scanned code as you like, for example:
      if (decodedText.startsWith("raven:") === true) {
        decodedText = decodedText.replace("raven:", "");
      }
      onChange(decodedText);
      html5QrcodeScanner.clear();
      onClose();
    }

    function onScanFailure(error) {
      // handle scan failure, usually better to ignore and keep scanning.
      // for example:
      // console.warn(`Code scan error = ${error}`);
    }

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);

    return function () {
      html5QrcodeScanner.clear();
    };
  }, []);

  return (
    <div className="glass padding-default" style={{margin: "10px"}}>
      <h1>Scan QR Reader</h1>
      <div id="reader"></div>
      <button
        className="unstyled-button glass"
        style={{ padding: "10px", margin: "10px" }}
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}
