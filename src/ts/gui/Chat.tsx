import { AbstractGuiElement } from "./AbstractGuiElement";
import * as ReactDOM from "react-dom";
import React = require("react");
import * as $ from 'jquery';
import { ReactElement } from "react";

export class Chat extends AbstractGuiElement {

  constructor(container: JQuery) {
    super(container);
  }

  createElement(): ReactElement {
    return <span>
      <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css' />
      <div id='collabChat' className='guiElement'>
        <h1>Chat</h1>
      </div>
    </span>
  }


  onRoomChanged(): void {
    this.sendMessage("Welcome to this room! 123");
  }

  sendMessage(msg: string) {
    this.currentRoom.user.messages.push(new ChatMessage(msg));
    this.currentRoom.applyUpdate();
  }
}

export class ChatMessage {
  time: number;

  constructor(public message: string) {
    this.time = Date.now();
  }
}
