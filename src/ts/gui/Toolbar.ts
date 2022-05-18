import { AbstractGuiElement } from "./AbstractGuiElement";

export class Toolbar extends AbstractGuiElement {

  // Create Abstract Class and folder for tools
  static TOOLS = [ // https://www.w3schools.com/bootstrap/bootstrap_ref_comp_glyphs.asp
    { name: "Orbit" },
    { name: "FP" },
    { name: "<i class='glyphicon glyphicon-move'></i>" },
  ];

  constructor(container: JQuery) {
    super(container, Toolbar.html());
  }

  static html(): string {
    let html = "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'><div id='collabToolbar' class='guiElement'>";
    for (let tool of this.TOOLS) {
      html += `<button>${tool.name}</button>`;
    }
    html += "</div>";
    return html;
  }
}

