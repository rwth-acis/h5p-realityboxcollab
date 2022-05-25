import { ReactElement } from 'react';
import React = require('react');
import { YArrayEvent } from 'yjs';
import { Room, User } from '../networking/Room';
import { RealityBoxCollab } from '../RealityboxCollab';
import { AbstractGuiElement } from './AbstractGuiElement';

export class Settings extends AbstractGuiElement {

  constructor(container: JQuery) {
    super(container);
  }

  createElement(): ReactElement {
    return <div id='collabSettings' className='guiElement'>
      <h1 className='elementHeading'>Settings</h1>
      {!this.currentRoom &&
        <>
          <button onClick={e => this.createRoom()}>Create Room</button>
          <button>Join Room</button>
        </>
      }
      {this.currentRoom &&
        <>
          You are in room {this.currentRoom.name}<br></br>
          {this.currentRoom.users.length} users are in this room
        </>
      }
    </div>
  }

  onRoomChanged(): void {
    super.updateView();

    this.currentRoom.users.observe((evt: YArrayEvent<User>) => {
      super.updateView();
    });
  }

  createRoom() {
    let name = prompt("Enter a name for the new room");
    if (name) {
      RealityBoxCollab.instance.room = new Room(RealityBoxCollab.instance.elements, name, true);
    }
  }
}