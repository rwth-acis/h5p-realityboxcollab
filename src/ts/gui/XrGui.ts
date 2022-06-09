import * as GUI from "babylonjs-gui";
import { AbstractTool } from "../tools/AbstractTool";
import { Toolbar } from "./Toolbar";


export class XrGui {
    xrGuiPanel: GUI.StackPanel;
    buttons: Map<AbstractTool, GUI.Button> = new Map();

    constructor(private toolbar: Toolbar, private scene: BABYLON.Scene) {
        this.createXRGui();
    }

    onXRStateChanged(newState: boolean): void {
        this.xrGuiPanel.notRenderable = !newState;
        this.updateButtons();
    }

    createXRGui(): void {
        let xrGui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene as any);
        this.xrGuiPanel = new GUI.StackPanel();
        this.xrGuiPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.xrGuiPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        xrGui.addControl(this.xrGuiPanel);

        for (let tool of this.toolbar.tools) {
            this.xrGuiPanel.addControl(this.createButton(tool));
        }

        this.xrGuiPanel.notRenderable = true;
    }

    createButton(tool: AbstractTool): GUI.Button {
        var button = GUI.Button.CreateSimpleButton("but", tool.name);
        button.width = 0.5;
        button.fontSize = "60px";
        button.height = "120px";
        button.background = "gray";
        button.paddingTop = "20px";
        button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        button.onPointerClickObservable.add(() => {
            this.toolbar.toolClicked(tool);
            this.updateButtons();
        });
        return button;
    }

    updateButtons(): void {
        this.buttons.forEach((b, t) => this.updateButton(t, b));
    }

    updateButton(tool: AbstractTool, button: GUI.Button): void {
        button.color = tool.active ? "red" : "black";
    }

}