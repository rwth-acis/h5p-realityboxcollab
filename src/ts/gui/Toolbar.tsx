import React = require("react");
import { AbstractGuiElement } from "./AbstractGuiElement";

export class Toolbar extends AbstractGuiElement {

  // Create Abstract Class and folder for tools
  static TOOLS = [ // https://www.w3schools.com/bootstrap/bootstrap_ref_comp_glyphs.asp
    { name: "Orbit" },
    { name: "FP" },
    { name: "Move", icon: "glyphicon glyphicon-move"},
  ];

  constructor(container: JQuery) {
    super(container,
      <div id='collabToolbar' className='guiElement'>
        {Toolbar.TOOLS.map(tool =>
          <button>{tool.icon ? <i className={tool.icon}></i> : tool.name}</button>
        )}
      </div>
    );
  }

  onRoomChanged(): void {

  }

}

