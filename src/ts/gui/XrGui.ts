import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { AdvancedDynamicTexture, Button, Control, StackPanel } from "@babylonjs/gui";
import { RealityBoxCollab } from "../RealityboxCollab";
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

        for (let tool of this.toolbar.tools) {
            let b = this.createButton(tool);
            this.buttons.set(tool, b);
            this.xrGuiPanel.addControl(b);
        }

        this.xrGuiPanel.isVisible = false;
    }

    createButton(tool: AbstractTool): Button {
        var button = Button.CreateSimpleButton("but", tool.name);
        button.width = 0.5;
        button.fontSize = "60px";
        button.height = "120px";
        button.background = "gray";
        button.paddingTop = "20px";
        button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        button.onPointerClickObservable.add(() => {
            this.toolbar.toolClicked(tool);
            this.updateButtons();
        });
        return button;
    }

    updateButtons(): void {
        this.buttons.forEach((b, t) => this.updateButton(t, b));
    }

    updateButton(tool: AbstractTool, button: Button): void {
        button.color = tool.active ? "red" : "black";
    }

}