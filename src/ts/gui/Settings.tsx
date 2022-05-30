import { ReactElement } from 'react';
import { Room } from '../networking/Room';
import { RoomInformation } from '../networking/RoomManager';
import { RealityBoxCollab } from '../RealityboxCollab';
import { AbstractGuiElement } from './AbstractGuiElement';
import React = require('react');

export class Settings extends AbstractGuiElement {

  constructor(container: JQuery) {
    super(container);
  }

  createElement(): ReactElement {
    return <div id='collabSettings' className='guiElement'>
      <h1 className='elementHeading'>Settings</h1>
      {!this.currentRoom &&
        this.viewNotInRoom()
      }
      {this.currentRoom &&
        this.viewInRoom()
      }
    </div>
  }

  viewNotInRoom(): React.ReactNode {
    return <>
      <button className='btn btn-primary' onClick={e => this.joinRoom(true)}>Create Room</button>
      <br></br>
      <button style={{marginTop: "10px"}} className='btn btn-primary' onClick={e => this.joinRoom(false)}>Join Room</button>
    </>;
  }

  viewInRoom(): React.ReactNode {
    return <>
      You are in room {this.currentRoom.roomInfo.name}<br></br>
      {this.currentRoom.users.size} users are in this room<br></br>
      Role: {this.currentRoom.user.role}
    </>;
  }

  onRoomChanged(): void {
    super.updateView();

    this.currentRoom.users.observe((evt, t) => {
      super.updateView();
    });
  }

  joinRoom(create: boolean) {
    const manager = RealityBoxCollab.instance.roomManager;
    let info: RoomInformation;

    if (create) {
      let name = prompt("Enter a name for the new room");
      if (name) {
        info = manager.createRoom(name, "");
        if (!info) {
          alert("Unable to create room: Name already in use");
          return;
        }
      }
    }
    else {
      let name = prompt("Enter the name of the room");
      if (name) {
        info = manager.getRoom(name);
        if (!info) {
          alert("This room does not exist");
          return;
        }
      }
    }

    RealityBoxCollab.instance.room = new Room([...RealityBoxCollab.instance.guiElements, ...RealityBoxCollab.instance.otherElements], info, create);
  }
}