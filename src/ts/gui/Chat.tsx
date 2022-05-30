import * as $ from 'jquery';
import { ReactElement } from "react";
import * as ReactDOM from "react-dom";
import * as Y from "yjs";
import { AbstractGuiElement } from "./AbstractGuiElement";
import React = require("react");

/**
 * Gui View for the Chat window
 */
export class Chat extends AbstractGuiElement {
  chatMessages: Y.Array<ChatMessage>; // The chat messages of the room

  constructor(container: JQuery) {
    super(container);
  }

  createElement(): ReactElement {
    return <span>
      <div id='collabChat' className='guiElement'>
        <h1 className='elementHeading'>Chat</h1>
        <div id="chatMessageField">

        </div>
        <input style={{ width: "80%" }} id="chatInput" onKeyDown={e => { if (e.key === 'Enter') this.sendInput(); }}></input>
        <button className="btn btn-primary" style={{ float: "right" }} disabled={this.currentRoom == undefined} onClick={this.sendInput.bind(this)}><i className="fa-solid fa-paper-plane"></i></button>
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
            this.addMessage(cm);
        });
      }
    });

    this.updateView();
  }

  /**
   * Send the current input of the input field.
   */
  private sendInput(): void {
    if (!this.currentRoom) return;

    this.sendMessage(createMessage($("#chatInput").val() as string, this.currentRoom.user.username));
    $("#chatInput").val("");
  }

  /**
   * Send a message to the chat. The messages will propagate to the other users. 
   * The message will not be explicitly added to the chat gui. 
   * The message will be added when the listener for the shared messages fires.
   * @param cm The chatmesssage to send
   */
  sendMessage(cm: ChatMessage) {
    this.chatMessages.insert(0, [cm]);
  }

  /**
   * Add a chatmessage to the chat gui
   * @param cm The chat message to add
   */
  private addMessage(cm: ChatMessage) {
    let own = cm.username === this.currentRoom.user.username;
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

/**
 * Represents a single chatmessage. Used for exchange between the clients
 */
export interface ChatMessage {
  time: number;
  message: string;
  username: string;
}

/**
 * Create a chat message dated at this instant.
 * @param message The chat message to send
 * @param username The username of the user or system
 * @returns The created chatmessage instance
 */
export function createMessage(message: string, username: string): ChatMessage {
  return {
    time: Date.now(),
    message: message,
    username: username
  };
}