import { ReactElement } from "react";
import React = require("react");
import { AbstractTool } from "../tools/AbstractTool";
import { AbstractGuiElement } from "./AbstractGuiElement";

export class Toolbar extends AbstractGuiElement {

    activeTool: AbstractTool;

    constructor(container: JQuery, public className: string, public alwaysActive: boolean, public tools: AbstractTool[]) {
        super(container);

        if (this.alwaysActive) {
            this.selectFirst();
        }
    }

    createElement(): ReactElement {
        return <div id={this.className} className='guiElement'>
            {this.tools.map(tool =>
                <button className={tool.active ? "toolbarBtnActive toolbarBtn" : "toolbarBtn"} disabled={!tool.canActivate()}
                    data-toggle="tooltip" data-placement="bottom"
                    title={tool.name} onClick={e => this.toolClicked(tool, e)}>
                    {tool.icon ? <i className={tool.icon}></i> : tool.name}
                </button>
            )}
        </div>
    }

    toolClicked(tool: AbstractTool, evt: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        if (this.activeTool && this.activeTool != tool) {
            this.activeTool.active = false;
            this.activeTool.onDeactivate();
        }

        if (!tool.active) {
            if (!tool.canActivate()) {
                console.error(`Tried to activate ${tool.name} which is not allowed`);
            }
            this.activeTool = tool;
            this.activeTool.active = true;
            this.activeTool.onActivate();
        }
        else if (!this.alwaysActive) {
            tool.active = false;
            tool.onDeactivate();
        }

        super.updateView();
    }

    onRoomChanged(): void {
        this.tools.forEach(t => { t.onRoomChanged(); t.currentRoom = this.currentRoom; t.active = false; });

        if (this.alwaysActive)
            this.selectFirst();
        this.updateView();
    }

    selectFirst() {
        for (let tool of this.tools) {
            if (tool.canActivate()) { // Find first tool, which can be activated
                this.activeTool = tool;
                this.activeTool.active = true;
                this.activeTool.onActivate();
                break;
            }
        }
    }
}