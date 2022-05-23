import { ReactElement } from "react";
import React = require("react");
import { AbstractGuiElement } from "./AbstractGuiElement";

export class Toolbar extends AbstractGuiElement {

  // Create Abstract Class and folder for tools
  tools = [ // https://fontawesome.com/icons
    { name: "Orbit Tool", icon: "fa-thin fa-solar-system" },
    { name: "First Person View", icon: "fa-solid fa-eye" },
    { name: "Move Tool", icon: "fa-solid fa-arrows-up-down-left-right" },
    { name: "Pointer Tool", icon: "fa-solid fa-person-chalkboard" },
    { name: "Annotation Tool", icon: "fa-solid fa-notes" },
    { name: "Draw Tool", icon: "fa-solid fa-pen" }
  ];

  constructor(container: JQuery) {
    super(container);
  }

  createElement(): ReactElement {
    return <div id='collabToolbar' className='guiElement'>
      {this.tools.map(tool =>
        <button>{tool.icon ? <i className={tool.icon}></i> : tool.name}</button>
      )}
    </div>
  }

  onRoomChanged(): void {

  }

}

