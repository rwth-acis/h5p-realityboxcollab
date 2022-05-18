import { AbstractGuiElement } from './AbstractGuiElement';

export class Settings extends AbstractGuiElement {

  constructor(container: JQuery) {
    let html = "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'><div id='collabSettings'>";
    html += "<h1 style='color: gray'>Settings</h1>";
    html += "</div>";

    super(container, html);
  }
}

