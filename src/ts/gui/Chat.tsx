import * as $ from 'jquery';
import * as Y from 'yjs';
import { ReactElement } from "react";
import * as ReactDOM from "react-dom";
import { AbstractGuiElement } from "./AbstractGuiElement";
import React = require("react");
import { Role } from '../networking/Room';

/**
 * Gui View for the Chat window
 */
export class Chat extends AbstractGuiElement {
  chatMessages: Y.Array<ChatMessage>; // The chat messages of the room

  constructor(container: JQuery) {
    super(container);
  }

  override createElement(): ReactElement {
    return <span>
      <div id='collabChat' className='guiElement'>
        <h1 className='elementHeading'>Chat</h1>
        <div id="chatMessageField">

        </div>
        <input style={{ width: "80%" }} id="chatInput" onKeyDown={e => { if (e.key === 'Enter') this.sendInput(); }}></input>
        <button className="btn btn-primary" style={{ float: "right" }} disabled={!this.canUse()} onClick={this.sendInput.bind(this)}><i className="fa-solid fa-paper-plane"></i></button>
      </div>
    </span>
  }

  private canUse(): boolean {
    if (!this.currentRoom.roomInfo.settings) {
      console.log("No settings... (Temp)");
      return true;
    }
    return !this.currentRoom.isLocal && (this.currentRoom.roomInfo.settings.canUseChat || this.currentRoom.user.role == Role.HOST || this.currentRoom.user.role == Role.CO_HOST);
  }

  override onRoomChanged(): void {
    $("#chatMessageField").empty();
    this.chatMessages = this.currentRoom.doc.getArray("chatMessages");

    if (this.currentRoom.isLocal) { this.updateView(); return; }

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

  override onSettingsChanged(): void {
    super.updateView();
  }

  /**
   * Send the current input of the input field.
   */
  private sendInput(): void {
    if (!this.canUse()) return;

    this.sendMessage(Chat.createMessage($("#chatInput").val() as string, this.currentRoom.user.username));
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
   * Add a chatmessage to the chat gui. The message will not be added, if the user is in their local room
   * @param cm The chat message to add
   */
  private addMessage(cm: ChatMessage): void {
    if (this.currentRoom.isLocal) return;

    let own = cm.username === this.currentRoom.user.username;
    let div = document.createElement("div");
    div.classList.add("chatContainer");
    let date: Date = new Date(cm.time);

    ReactDOM.render(
      <div className={own ? 'ownChatMessage chatMessage' : 'chatMessage'}>
        <div className="chatHeader">
          <p className="chatUsername">{cm.username}</p>
          <p className="chatTime">{date.getHours() < 10 ? "0" + date.getHours() : date.getHours()}:{date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}</p>
        </div>
        <p>{cm.message}</p>
      </div>
      , div
    );

    const container = $("#chatMessageField");

    container.append(div);
    container.scrollTop(container[0].scrollHeight);
  }

  /**
   * Create a chat message dated at this instant.
   * @param message The chat message to send
   * @param username The username of the user or system
   * @returns The created chatmessage instance
   */
  static createMessage(message: string, username: string): ChatMessage {
    return {
      time: Date.now(),
      message: message,
      username: username
    };
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