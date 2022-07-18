import { ReactElement, ReactNode } from 'react';
import { Accordion } from 'react-bootstrap';
import { Role, Room } from '../networking/Room';
import { RoomInformation } from '../networking/RoomManager';
import { DEFAULT_SETTINGS, SETTINGS } from '../networking/RoomSettings';
import { RealityBoxCollab } from '../RealityboxCollab';
import { Utils } from '../utils/Utils';
import { AbstractGuiElement } from './AbstractGuiElement';
import { Popups } from './popup/Popups';
import React = require('react');

export class Settings extends AbstractGuiElement {

  lastSize: number = 0;

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
            <button className='btn btn-secondary' style={{ marginTop: "10px" }} onClick={e => Popups.showQRCode(this.instance, Utils.getJoinURL(this.instance))}>Share...</button>
            <br></br>
            <button className='btn btn-secondary' style={{ marginTop: "10px" }} onClick={e => this.currentRoom.disconnect()}>Leave Room</button>
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

    this.currentRoom.users.observe((e) => {
      if (this.currentRoom.users.size != this.lastSize) {
        this.lastSize = this.currentRoom.users.size;
        super.updateView();
      }
    });
  }

  override onSettingsChanged(): void {
    super.updateView();
  }

  joinRoom(create: boolean) {
    const manager = this.instance.roomManager;

    if (create) {
      let p = Popups.createRoom((room, password, user) => {
        if (!Room.checkUsername(user)) return;

        let info = manager.createRoom(room, password);
        if (!info) return;

        p.close();
        this.instance.room = new Room(this.instance, this.instance.getListeners(), info, create, user, false);
      });
    }
    else {
      let p = Popups.joinRoom((room, password) => {
        let info = manager.getRoom(room);
        if (!info || info.password !== password) {
          Popups.alert("Invalid roomname or password")
          return;
        }
        p.close();
        this.instance.room = new Room(this.instance, this.instance.getListeners(), info, create, undefined, false);
      });
    }

  }
}