import { AbstractGuiElement } from "./AbstractGuiElement";

export class Chat extends AbstractGuiElement {
  
  constructor(container: JQuery) {
    let html = "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'><div id='collabChat' class='guiElement'>";
    html += "<h1>Chat</h1>";
    html += "</div>";

    super(container, html);
  }

  onRoomChanged(): void {
    this.sendMessage("Welcome to this room!");
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
