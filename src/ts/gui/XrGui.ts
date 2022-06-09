import { AbstractTool } from "../tools/AbstractTool";
import { Toolbar } from "./Toolbar";
import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { AdvancedDynamicTexture, Button, Control, StackPanel } from "@babylonjs/gui";


export class XrGui {
    xrGuiPanel: StackPanel;
    buttons: Map<AbstractTool, Button> = new Map();

    constructor(private toolbar: Toolbar, private scene: BABYLON.Scene) {
        this.createXRGui();
    }

    onXRStateChanged(newState: boolean): void {
        this.xrGuiPanel.notRenderable = !newState;
        this.updateButtons();
    }

    createXRGui(): void {
        let xrGui = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene as any);
        this.xrGuiPanel = new StackPanel();
        this.xrGuiPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.xrGuiPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        xrGui.addControl(this.xrGuiPanel);

        for (let tool of this.toolbar.tools) {
            this.xrGuiPanel.addControl(this.createButton(tool));
        }

        this.xrGuiPanel.notRenderable = true;
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