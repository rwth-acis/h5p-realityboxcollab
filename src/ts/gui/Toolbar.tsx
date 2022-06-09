import { ReactElement } from "react";
import React = require("react");
import { AbstractTool } from "../tools/AbstractTool";
import { AbstractGuiElement } from "./AbstractGuiElement";

export class Toolbar extends AbstractGuiElement {

    activeTool: AbstractTool;

    /**
     * Create a new toolbar
     * @param container The container to add this toolbar to
     * @param name The name for the id of this toolbars root div element
     * @param alwaysActive If true, one tools is always activated (first available when creating)
     * @param tools The tools for this toolbar
     */
    constructor(container: JQuery, public name: string, public alwaysActive: boolean, public tools: AbstractTool[]) {
        super(container);

        if (this.alwaysActive) {
            this.selectFirst();
        }

        tools.forEach(t => t.init(this));
    }

    override createElement(): ReactElement {
        return <div id={this.name} className='guiElement'>
            {this.tools.map(tool =>
                <button className={tool.active ? "toolbarBtnActive toolbarBtn" : "toolbarBtn"} disabled={!tool.canActivate()}
                    data-toggle="tooltip" data-placement="bottom"
                    title={tool.name} onClick={e => this.toolClicked(tool)}>
                    {tool.icon ? <i className={tool.icon}></i> : tool.name}
                </button>
            )}
        </div>
    }

    toolClicked(tool: AbstractTool): void {
        if (this.activeTool && this.activeTool != tool) this.deactivate(this.activeTool);

        if (!tool.active) {
            this.activateTool(tool);
        } else if (!this.alwaysActive) { // Toggle
            this.deactivate(tool);
        }

        super.updateView();
    }

    activateTool(tool: AbstractTool): void {
        if (!tool.canActivate()) {
            console.error(`Tried to activate ${tool.name} which is not allowed`);
        }
        this.activeTool = tool;
        this.activeTool.active = true;
        this.activeTool.onActivate();
    }

    private deactivate(tool: AbstractTool): void {
        if (this.activeTool != tool) return;

        tool.active = false;
        tool.onDeactivate();
        this.activeTool = undefined;
    }

    deactivateTool(tool: AbstractTool): void {
        this.deactivate(tool);

        if (this.alwaysActive) {
            this.selectFirst();
        }
    }

    override onRoomChanged(): void {
        this.tools.forEach(t => { t.onRoomChanged(); t.currentRoom = this.currentRoom; t.active = false; });

        if (this.alwaysActive) this.selectFirst();
        this.updateView();
    }

    override onSettingsChanged(): void {
        this.updateView();
    }

    selectFirst(): void {
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