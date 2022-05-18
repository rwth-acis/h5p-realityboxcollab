import { AbstractGuiElement } from './AbstractGuiElement';

export class Settings extends AbstractGuiElement {

  constructor(container: JQuery) {
    let html = "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'><div id='collabSettings' class='guiElement'>";
    html += "<h1>Settings</h1>";
    html += "</div>";

    super(container, html);
    console.log(this.element);
  }
}