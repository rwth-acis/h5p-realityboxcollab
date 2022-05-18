import { AbstractGuiElement } from "./AbstractGuiElement";

export class Chat extends AbstractGuiElement {

  element: JQuery;
  container: JQuery;

  constructor(container: JQuery) {
    let html = "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'><div id='collabChat' class='guiElement'>";
    html += "<h1>Chat</h1>";
    html += "</div>";

    super(container, html);
  }
}
