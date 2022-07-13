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

    /**
     * Activates or toggles the clicked tool. This method is invoked by this toolsbars UI and by the XrGui
     * @param tool The tools which has been clicked
     */
    toolClicked(tool: AbstractTool): void {
        if (!tool.active) {
            this.activateTool(tool);
        }
        else if (!this.alwaysActive) { // Toggle
            this.deactivateActiveRaw();
            super.updateView();
        }
    }

    /**
     * Activates a tool. The current active tool will be deactivated. The method does nothing, if the tool is already active.
     * @param tool The tool to activate
     * @throws Exception, if the tool can not be activated according to its {@link AbstractTool.canActivate()} method
     * @throws Exception, if the tool is not part of this toolbar
     */
    activateTool(tool: AbstractTool): void {
        if (tool == this.activeTool) return;

        if (this.activeTool) {
            this.deactivateActiveRaw();
        }

        if (!tool.canActivate()) {
            throw `Tried to activate ${tool.name} which is not allowed`;
        }
        if (!this.tools.find(x => x == tool)) {
            throw `Tool ${tool.name} is not part of the tools of the toolbar with id ${this.name}`;
        }

        this.activeTool = tool;
        this.activeTool.active = true;
        this.activeTool.onActivate();

        super.updateView();
    }

    /**
     * Deactivates the active tool, selects the first useable (if alwaysActive is set)
     * and updates the view.
     */
    deactivateActiveTool(): void {
        this.deactivateActiveRaw();

        if (this.alwaysActive) {
            this.selectFirst();
        }
        super.updateView();
    }

    /**
     * Only deactives the active tool, without any further updates including view changes
     */
    private deactivateActiveRaw(): void {
        this.activeTool.active = false;
        this.activeTool.onDeactivate();
        this.activeTool = undefined;
    }

    /**
     * Resets the tools and notifies them of the room change
     */
    override onRoomChanged(): void {
        if (this.activeTool) this.deactivateActiveTool();

        this.tools.forEach(t => { t.currentRoom = this.currentRoom; t.onRoomChanged(); });

        if (this.alwaysActive) this.selectFirst();
        this.updateView();
    }

    /**
     * Permissions might have been updated. Therefore, redraw the toolbar
     */
    override onSettingsChanged(): void {
        if (this.activeTool && !this.activeTool.canActivate()) {
            this.deactivateActiveTool();
        }
        this.updateView();
    }

    /**
     * Goes through all tools and activates the first useable. This method does not deactivate the current active tool, if any is active
     */
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