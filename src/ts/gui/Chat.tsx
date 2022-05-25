import * as $ from 'jquery';
import { ReactElement } from "react";
import * as ReactDOM from "react-dom";
import * as Y from "yjs";
import { AbstractGuiElement } from "./AbstractGuiElement";
import React = require("react");

export class Chat extends AbstractGuiElement {
  chatMessages: Y.Array<ChatMessage>;
  ownMessages: ChatMessage[] = [];

  constructor(container: JQuery) {
    super(container);
  }

  createElement(): ReactElement {
    return <span>
      <div id='collabChat' className='guiElement'>
        <h1 className='elementHeading'>Chat</h1>
        <div id="chatMessageField">

        </div>
        <input id="chatInput" onKeyDown={e => { if (e.key === 'Enter') this.onChatSend();}}></input>
        <button disabled={this.currentRoom == undefined} onClick={this.onChatSend.bind(this)}>Send</button>
      </div>
    </span>
  }

  onRoomChanged(): void {
    this.chatMessages = this.currentRoom.doc.getArray("chatMessages");
    this.chatMessages.delete(0, this.chatMessages.length); // Debug: Remove all messages

    this.chatMessages.observe((evt: Y.YArrayEvent<ChatMessage>) => {
      if (evt.changes.delta[0] && evt.changes.delta[0].insert) {
        let added = evt.changes.delta[0].insert as ChatMessage[];
        added.forEach(cm => {
          if (!this.ownMessages.find(own => chatMessageEquals(own, cm)))
            this.addMessage(cm, false);
        });
      }
    });

    this.updateView();
  }

  onChatSend() {
    if (!this.currentRoom) return;

    this.sendMessage($("#chatInput").val() as string);
    $("#chatInput").val("");
  }

  sendMessage(msg: string) {
    let cm = createMessage(msg, this.currentRoom.user.username);
    this.ownMessages.push(cm);
    this.addMessage(cm, true);
    this.chatMessages.insert(0, [cm]);
  }

  private addMessage(cm: ChatMessage, own: boolean) {
    let div = document.createElement("div");
    div.classList.add("chatContainer");

    ReactDOM.render(
      <div className={own ? 'ownChatMessage chatMessage' : 'chatMessage'}>
        <p className="chatUsername">{cm.username}</p>
        <p>{cm.message}</p>
      </div>
      , div
    );

    $("#chatMessageField").append(div);
  }
}

export interface ChatMessage {
  time: number;
  message: string;
  username: string;
}

function createMessage(message: string, username: string): ChatMessage {
  return {
    time: Date.now(),
    message: message,
    username: username
  };
}

function chatMessageEquals(a: ChatMessage, b: ChatMessage): boolean {
  return a.message === b.message && a.time == b.time && a.username == b.username;
}
