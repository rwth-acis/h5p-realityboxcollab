import { ReactNode, useRef } from "react";
import React = require("react");
import { RealityBoxCollab } from "../../RealityboxCollab";
import { Popup } from "./Popup";

declare let H5P: any;
H5P = H5P || {};

export class Popups {

  static showQRCode(instance: RealityBoxCollab, url: string): Popup {
    const react: ReactNode = <> <div className="centerContents">
      Open this room with the following URL or QR Code:
      <div className="kewar"></div>
      <input
        style={{}}
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
    return popup;
  }

  static createRoom(callback: (name: string, password: string, user: string) => void): Popup {
    const react: ReactNode = <> <div className="centerContents">
      Create a new room:
      <form>
        <div className="form-group">
          <label htmlFor="inputRoomName">Room Name</label>
          <input className="form-control" id="inputRoomName" placeholder="Enter a roomname" />
        </div>
        <div className="form-group">
          <label htmlFor="inputPassword">Password</label>
          <input type="password" className="form-control" id="inputPassword" placeholder="Enter a new password" />
        </div>
        <div className="form-group">
          <label htmlFor="inputUsername">Username</label>
          <input className="form-control" id="inputUsername" placeholder="Enter your new username" />
        </div>
      </form>
      <br></br>
      <button className="btn btn-primary" onClick={(e) => callback(val("inputRoomName"), val("inputPassword"), val("inputUsername"))}>Create room</button>
    </div>
    </>;

    let popup = new Popup('', react, "800px");
    popup.open();
    return popup;
  }

  static joinRoom(callback: (name: string, password: string) => void): Popup {
    const react: ReactNode = <> <div className="centerContents">
      Join an existing room:
      <form>
        <div className="form-group">
          <label htmlFor="inputRoomName">Room Name</label>
          <input className="form-control" id="inputRoomName" placeholder="Enter the name of the room" />
        </div>
        <div className="form-group">
          <label htmlFor="inputPassword">Password</label>
          <input type="password" className="form-control" id="inputPassword" placeholder="Enter the password of the room" />
        </div>
      </form>
      <br></br>
      <button className="btn btn-primary" onClick={(e) => callback(val("inputRoomName"), val("inputPassword"))}>Join</button>
    </div>
    </>;

    let popup = new Popup('', react, "800px");
    popup.open();
    return popup;
  }

  static input(title: string, description: string, callback: (str: string) => void): Popup {
    const react: ReactNode = <> <div className="centerContents">
      {title}
      <form>
        <div className="form-group">
          <label htmlFor="inputStr">{description}</label>
          <input className="form-control" id="inputStr"/>
        </div>
      </form>
      <br></br>
      <button className="btn btn-primary" onClick={(e) => callback(val("inputStr"))}>Ok</button>
    </div>
    </>;

    let popup = new Popup('', react, "800px");
    popup.open();
    return popup;
  }

}

function val(id: string): string {
  return (document.getElementById(id) as HTMLInputElement).value;
}