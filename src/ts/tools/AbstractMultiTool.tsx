import { ReactElement } from "react";
import { AbstractTool } from "./AbstractTool";
import React = require("react");
import ReactDOM = require("react-dom");
import { RoomSettings } from "../networking/RoomSettings";

export abstract class AbstractMultiTool extends AbstractTool {

  element: any;
  activeTool: SubTool;

  constructor(name: string, icon: string, container: JQuery, public subtools: SubTool[], setting?: (s: RoomSettings) => boolean) {
    super(name, icon, setting);

    this.element = document.createElement("div");
    container.append(this.element);
  }

  createElement(): ReactElement {
    return <div id='collabSubToolbar' className='guiElement'>
      {this.subtools.map(tool =>
        <button className={tool == this.activeTool ? "toolbarBtnActive toolbarBtn" : "toolbarBtn"}
          data-toggle="tooltip" data-placement="bottom"
          title={tool.name} onClick={e => this.toolClicked(tool)}>
          {tool.icon ? <i className={tool.icon}></i> : tool.name}
        </button>
      )}
    </div>
  }

  toolClicked(tool: SubTool): void {
    if (this.active) {
      this.activeTool = tool;
      this.render();
    }
  }

  override onActivate(): void {
    this.activeTool = this.subtools[0];
    this.render();
  }

  override onDeactivate(): void {
    ReactDOM.render(<></>, this.element);
    this.onSubToolSwitched(null);
  }

  private render(): void {
    ReactDOM.render(this.createElement(), this.element);
    this.onSubToolSwitched(this.activeTool);
  }

  /**
   * Called when switching between tools
   * @param subtool The tool which is now active or null if the tool is now deactivated
   */
  abstract onSubToolSwitched(subtool: SubTool): void;
}

export interface SubTool {
  name: string;
  icon: string;
}