import { ReactElement, ReactNode } from 'react';
import { Accordion } from 'react-bootstrap';
import { Role, Room } from '../networking/Room';
import { RoomInformation } from '../networking/RoomManager';
import { SETTINGS } from '../networking/RoomSettings';
import { RealityBoxCollab } from '../RealityboxCollab';
import { AbstractGuiElement } from './AbstractGuiElement';
import React = require('react');

export class Settings extends AbstractGuiElement {

  constructor(private instance: RealityBoxCollab, container: JQuery) {
    super(container);
  }

  override createElement(): ReactElement {
    return <div id='collabSettings' className='guiElement'>
      <h1 className='elementHeading'>Settings</h1>
      {this.currentRoom.isLocal &&
        this.viewNotInRoom()
      }
      {!this.currentRoom.isLocal &&
        this.viewInRoom()
      }
    </div>
  }

  /**
   * View for the settings when not currently in a remote room (<=> when in a local room)
   * @returns The view 
   */
  viewNotInRoom(): ReactNode {
    return <>
      <button className='btn btn-primary' onClick={e => this.joinRoom(true)}>Create Room</button>
      <br></br>
      <button style={{ marginTop: "10px" }} className='btn btn-primary' onClick={e => this.joinRoom(false)}>Join Room</button>
    </>;
  }

  /**
   * View for the settings when currently connected to a remote room
   * @returns The view
   */
  viewInRoom(): ReactNode {
    return <>
      <br></br>

      <Accordion defaultActiveKey="0">
        <Accordion.Item eventKey="0">
          <Accordion.Header>Room Information</Accordion.Header>
          <Accordion.Body>
            Room Name: {this.currentRoom.roomInfo.name}<br></br>
            Users: {this.currentRoom.users.size}<br></br>
            Role: {this.currentRoom.user.role}<br></br>
            <button className='btn' onClick={e => this.currentRoom.disconnect()}>Leave Room</button>
          </Accordion.Body>
        </Accordion.Item>
        {(this.currentRoom.user.role == Role.HOST || this.currentRoom.user.role == Role.CO_HOST)
          &&
          <Accordion.Item eventKey="1">
            <Accordion.Header>Settings</Accordion.Header>
            <Accordion.Body>

              {SETTINGS.map(e =>
                e.createElement(this.currentRoom)
              )}
            </Accordion.Body>
          </Accordion.Item>
        }
      </Accordion>
    </>;
  }


  onRoomChanged(): void {
    super.updateView();

    this.currentRoom.users.observe(() => {
      super.updateView();
    });
  }

  override onSettingsChanged(): void {
    super.updateView();
  }

  joinRoom(create: boolean) {
    const manager = this.instance.roomManager;
    let info: RoomInformation;

    if (create) {
      let name = prompt("Enter a name for the new room");
      if (name) {
        info = manager.createRoom(name, "");
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

    if (info) {
      this.instance.room = new Room(this.instance, this.instance.getListeners(), info, create, false);
    }
  }
}