import { ReactElement } from 'react';
import { Role, Room, RoomSettings } from '../networking/Room';
import { RoomInformation } from '../networking/RoomManager';
import { RealityBoxCollab } from '../RealityboxCollab';
import { AbstractGuiElement } from './AbstractGuiElement';
import React = require('react');
import { Accordion } from 'react-bootstrap';

export class Settings extends AbstractGuiElement {

  constructor(container: JQuery) {
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
  viewNotInRoom(): React.ReactNode {
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
  viewInRoom(): React.ReactNode {
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
        {(this.currentRoom.user.role == Role.HOST || this.currentRoom.user.role == Role.CO_HOST || true)
          &&
          <Accordion.Item eventKey="1">
            <Accordion.Header>Settings</Accordion.Header>
            <Accordion.Body>

              {SETTINGS.map(e =>
                this.createSetting(e, this.currentRoom.settings)
              )}
            </Accordion.Body>
          </Accordion.Item>
        }
      </Accordion>
    </>;
  }

  private createSetting(e: SettingsGuiElement, s: RoomSettings): React.ReactNode {
    return <>
    {
        e.type == SettingsType.Heading &&
        <h4>{e.name}</h4>
      }
      {
        e.type == SettingsType.Checkbox &&
        <label><input type="checkbox" checked={e.property(s)} onChange={() => { e.toggle(s); this.currentRoom.onSettingsUpdated(); }} />&nbsp;&nbsp;{e.name}</label>
      }
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

    if (info) {
      RealityBoxCollab.instance.room = new Room(RealityBoxCollab.instance.getListeners(), info, create, false);
    }
  }
}

export enum SettingsType {
  Checkbox, Heading
}

export interface SettingsGuiElement {
  name: string,
  type: SettingsType,
  property?: (s: RoomSettings) => any,
  toggle?: (s: RoomSettings) => any
}

export const SETTINGS: SettingsGuiElement[] = [
  { name: "Users can...", type: SettingsType.Heading },
  { name: "use the Chat", property: s => s.canUseChat, toggle: s => s.canUseChat = !s.canUseChat, type: SettingsType.Checkbox }
]