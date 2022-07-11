import { ReactNode } from "react";
import React = require("react");
import { RealityBoxCollab } from "../../RealityboxCollab";
import { Popup } from "./Popup";

declare let H5P: any;
H5P = H5P || {};

export class Popups {

  static showQRCode(instance: RealityBoxCollab, url: string) {
    const react: ReactNode = <> <div className="inner-content">
      Open this room with the following URL or QR Code
      <div className="kewar"></div>
      <input
        className="url-input"
        type="text"
        value={url}
        size={url.length + 1}
        readOnly
      />
    </div>
    </>;

    let popup = new Popup('', react, "800px");
    let kewar = H5P.newRunnable({
      library: 'H5P.KewArCode 0.1.0',
      params: {
        codeType: 'url',
        url: url,
        behaviour: {
          maxSize: '150px'
        }
      }
    }, instance.id, undefined, undefined, { parent: this });
    popup.open();

    kewar.attach(popup.root.find('.kewar'));
  }
}