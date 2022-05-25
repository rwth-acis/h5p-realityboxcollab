import { ReactElement } from "react";
import { AbstractTool } from "./AbstractTool";
import React = require("react");
import ReactDOM = require("react-dom");

export abstract class AbstractMultiTool extends AbstractTool {

  element: any;
  activeTool: SubTool;

  constructor(name: string, icon: string, container: JQuery, public subtools: SubTool[]) {
    super(name, icon);

    this.element = document.createElement("div");
    container.append(this.element);
  }

  createElement(): ReactElement {
    return <div id='collabSubToolbar' className='guiElement'>
      {this.subtools.map(tool =>
        <button className={tool == this.activeTool ? "toolbarBtnActive toolbarBtn" : "toolbarBtn"}
          data-toggle="tooltip" data-placement="bottom"
          title={tool.name} onClick={e => this.toolClicked(tool, e)}>
          {tool.icon ? <i className={tool.icon}></i> : tool.name}
        </button>
      )}
    </div>
  }

  toolClicked(tool: SubTool, e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    if (this.active) {
      this.activeTool = tool;
      this.render();
    }
  }

  onActivate(): void {
    this.activeTool = this.subtools[0];
    this.render();
  }

  render() {
    ReactDOM.render(this.createElement(), this.element);
    this.onSubToolSwitched(this.activeTool);
  }

  onDeactivate(): void {
    ReactDOM.render(<></>, this.element);
  }

  abstract onSubToolSwitched(subtool: SubTool): void;
}

export interface SubTool {
  name: string;
  icon: string;
}