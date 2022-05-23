import { ReactElement } from 'react';
import React = require('react');
import { Room } from '../networking/Room';
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
          You are in room {this.currentRoom.name}
        </>
      }
    </div>
  }

  onRoomChanged(): void {
    super.updateView();
  }

  createRoom() {
    let name = prompt("Enter a name for the new room");
    if (name) {
      RealityBoxCollab.instance.room = new Room(RealityBoxCollab.instance.elements,name, true);
    }
  }
}