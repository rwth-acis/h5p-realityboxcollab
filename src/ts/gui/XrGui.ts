import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { AdvancedDynamicTexture, Button, Control, StackPanel } from "@babylonjs/gui";
import { RealityBoxCollab } from "../RealityboxCollab";
import { AbstractMultiTool } from "../tools/AbstractMultiTool";
import { AbstractTool } from "../tools/AbstractTool";
import { Toolbar } from "./Toolbar";


export class XrGui {
    xrGuiPanel: StackPanel;
    buttons: Map<AbstractTool, Button> = new Map();

    constructor(private toolbar: Toolbar, private scene: BABYLON.Scene, private instance: RealityBoxCollab) {
        this.createXRGui();
    }

    onXRStateChanged(inXR: boolean): void {
        this.xrGuiPanel.isVisible = inXR;
        this.instance.drawTool.setPickerState(inXR);
        this.updateButtons();
    }

    createXRGui(): void {
        let xrGui = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene as any);
        this.xrGuiPanel = new StackPanel();
        this.xrGuiPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.xrGuiPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.xrGuiPanel.left = "20 px";
        this.xrGuiPanel.top = "20 px";
        xrGui.addControl(this.xrGuiPanel);

        this.xrGuiPanel.isVisible = false;
    }

    createTool(tool: AbstractTool): Button[] {
        let subs: Button[] = [];
        if (tool instanceof AbstractMultiTool && tool.active) {
            subs = tool.subtools.map(s =>
                this.createButton(s.name, tool.activeTool == s, () => {
                    tool.activeTool = s;
                    tool.onSubToolSwitched(s);
                    this.updateButtons();
                }));
            subs.forEach(b => b.left = "100px");
        }
        return [this.createButton(tool.name, tool.active, () => {
            this.toolbar.toolClicked(tool);
            this.updateButtons();
        }), ...subs];
    }

    createButton(name: string, active: boolean, callback: () => void): Button {
        var button = Button.CreateSimpleButton("but", name);
        button.width = 0.5;
        button.fontSize = "60px";
        button.height = "120px";
        button.background = "gray";
        button.paddingTop = "20px";
        button.color = active ? "red" : "black";
        button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        button.onPointerClickObservable.add(callback);
        return button;
    }

    updateButtons(): void {
        this.xrGuiPanel.clearControls();
        for (let tool of this.toolbar.tools) {
            this.createTool(tool).forEach(b => {
                this.buttons.set(tool, b);
                this.xrGuiPanel.addControl(b);
            });
        }
    }

}