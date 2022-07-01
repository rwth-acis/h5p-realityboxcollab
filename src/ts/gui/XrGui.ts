import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { AdvancedDynamicTexture, Button, Control, StackPanel } from "@babylonjs/gui";
import { RealityBoxCollab } from "../RealityboxCollab";
import { AbstractMultiTool } from "../tools/AbstractMultiTool";
import { AbstractTool } from "../tools/AbstractTool";
import { XRState } from "./BabylonViewer";
import { Toolbar } from "./Toolbar";


export class XrGui {
    xrGuiPanel: StackPanel;
    buttons: Map<AbstractTool, Button> = new Map();

    constructor(private toolbar: Toolbar, private scene: BABYLON.Scene, private instance: RealityBoxCollab) {
        this.createXRGui();
    }

    onXRStateChanged(state: XRState): void {
        this.xrGuiPanel.isVisible = state != XRState.NONE;
        this.instance.drawTool.setPickerState(state != XRState.NONE);
        this.updatePanel(state);
    }

    createXRGui(): void {
        let xrGui = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene as any);
        this.xrGuiPanel = new StackPanel();
        this.xrGuiPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.xrGuiPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        xrGui.addControl(this.xrGuiPanel);

        this.xrGuiPanel.isVisible = false;
    }

    createTool(state: XRState, tool: AbstractTool): Button[] {
        let subs: Button[] = [];
        if (tool instanceof AbstractMultiTool && tool.active) {
            subs = tool.subtools.map(s =>
                this.createButton(state, s.name, tool.activeTool == s, () => {
                    tool.activeTool = s;
                    tool.onSubToolSwitched(s);
                    this.updatePanel(state);
                }));
            subs.forEach(b => b.left = "100px");
        }
        return [this.createButton(state, tool.name, tool.active, () => {
            this.toolbar.toolClicked(tool);
            this.updatePanel(state);
        }), ...subs];
    }

    createButton(state: XRState, name: string, active: boolean, callback: () => void): Button {
        var button = Button.CreateSimpleButton("but", name);
        button.width = 0.5;
        button.fontSize = state == XRState.AR ? "60px" : "30px";
        button.height = state == XRState.AR ? "120px" : "60px";
        button.background = "gray";
        button.paddingTop = "20px";
        button.color = active ? "red" : "black";
        button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        button.onPointerClickObservable.add(callback);
        return button;
    }

    updatePanel(state: XRState): void {
        this.xrGuiPanel.left = XRState.AR ? "20px" : "100px";
        this.xrGuiPanel.top = XRState.AR ? "20px" : "100px";

        this.xrGuiPanel.clearControls();
        for (let tool of this.toolbar.tools) {
            this.createTool(state, tool).forEach(b => {
                this.buttons.set(tool, b);
                this.xrGuiPanel.addControl(b);
            });
        }
    }

}