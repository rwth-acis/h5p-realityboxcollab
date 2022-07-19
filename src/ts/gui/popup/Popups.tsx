import { ReactNode } from "react";
import { RealityBoxCollab } from "../../RealityboxCollab";
import { Popup } from "./Popup";
import React = require("react");

declare let H5P: any;
H5P = H5P || {};

/**
 * This class defines the popups used in RealityboxCollab
 */
export class Popups {

  /**
   * Open a popup showing an url as text and QR code using KewArCode
   * @param instance The RealityboxCollab instance, used to attach KewArCode
   * @param url The url to display
   * @returns The created popup, which is already open
   */
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

  /**
   * Opens the create room dialog, asking for a room name, password and the username of the creating user. This dialog will not auto close.
   * @param callback Called when the 'Create Room' button is pressed
   * @returns The created popup, which is already open
   */
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

   /**
   * Opens the join room dialog, asking for a room name and the password. This dialog will not auto close.
   * @param callback Called when the 'Join' button is pressed
   * @returns The created popup, which is already open
   */
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

  /**
   * Generic input dialog. This dialog will not auto close.
   * @param title The title for this dialog
   * @param description The description used as title for the input field
   * @param callback The callback function, invoked when 'Ok' is clicked
   * @returns The created popup, which is already open
   */
  static input(title: string, description: string, callback: (str: string) => void): Popup {
    const react: ReactNode = <> <div className="centerContents">
      {title}
      <form>
        <div className="form-group">
          <label htmlFor="inputStr">{description}</label>
          <input className="form-control" id="inputStr" />
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

  /**
   * Simple message output dialog
   * @param title The title / message this popup shows
   * @returns The created popup, which is already open
   */
  static alert(title: string): Popup {
    const react: ReactNode = <> <div className="centerContents" style={{border: "1px solid red"}}>
      {title}
    </div>
    </>;

    let popup = new Popup('', react, "500px");
    popup.open();
    return popup;
  }

}

/**
 * Helper method to get the input value of a HTML input element
 * @param id The id of the HTML input element. It will not be checked if the component is actually a input element
 * @returns The input value
 */
function val(id: string): string {
  return (document.getElementById(id) as HTMLInputElement).value;
}