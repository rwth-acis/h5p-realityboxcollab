import { ReactElement } from "react";
import React = require("react");
import { AbstractTool } from "../tools/AbstractTool";
import { AnnotationTool } from "../tools/AnnotationTool";
import { DrawTool } from "../tools/DrawTool";
import { FirstPersonTool } from "../tools/FirstPersonTool";
import { MoveTool } from "../tools/MoveTool";
import { OrbitTool } from "../tools/OrbitTool";
import { PointerTool } from "../tools/PointerTool";
import { AbstractGuiElement } from "./AbstractGuiElement";

export class Toolbar extends AbstractGuiElement {

  tools: AbstractTool[] = [
    new OrbitTool(), new FirstPersonTool(), new MoveTool(), 
    new PointerTool(), new AnnotationTool(), new DrawTool()
  ];
  activeTool: AbstractTool;

  constructor(container: JQuery) {
    super(container);
  }

  createElement(): ReactElement {
    return <div id='collabToolbar' className='guiElement'>
      {this.tools.map(tool =>
        <button className={tool.active ? "toolbarBtnActive toolbarBtn" : "toolbarBtn"} data-toggle="tooltip" data-placement="bottom" title={tool.name} onClick={e => this.toolClicked(tool, e)}>
          {tool.icon ? <i className={tool.icon}></i> : tool.name}
        </button>
      )}
    </div>
  }

  toolClicked(tool: AbstractTool, evt: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    if (this.activeTool && this.activeTool != tool) {
      this.activeTool.active = false;
    }
    tool.active = !tool.active;
    if (tool.active) {
      this.activeTool = tool;
      this.activeTool.onActivate();
    }
    else {
      tool.onDeactivate();
    }

    super.updateView();
  }

  onRoomChanged(): void {
    this.tools.forEach(t => {t.onRoomChanged(); t.active = false;});
  }

}

