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
        <div id="chatMessageField">

        </div>
        <input id="chatInput"></input><button onClick={this.onChatSend.bind(this)}>Send</button>
      </div>
    </span>
  }

  onChatSend() {
    console.log($("#chatInput").val());
    this.sendMessage($("#chatInput").val() as string);
  }


  onRoomChanged(): void {
    this.addMessage("Welcome to this room!", false, "System");
  }

  sendMessage(msg: string) {
    this.addMessage(msg, true, "You");
    this.currentRoom.user.messages.push(new ChatMessage(msg));
    this.currentRoom.applyUpdate();
  }

  private addMessage(msg: string, own: boolean, username: string) {
    let div = document.createElement("div");
    div.classList.add("chatMessage");
    if (own)
      div.classList.add("ownChatMessage");

    ReactDOM.render(
      <>
        <p className="chatUsername">{username}</p>
        <p>{msg}</p>
      </>
      , div
    );

    $("#chatMessageField").append(div);
  }
}

export class ChatMessage {
  time: number;

  constructor(public message: string) {
    this.time = Date.now();
  }
}
