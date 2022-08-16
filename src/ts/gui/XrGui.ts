import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { AdvancedDynamicTexture, Button, Control, StackPanel } from "@babylonjs/gui";
import { RealityBoxCollab } from "../RealityboxCollab";
import { AbstractMultiTool } from "../tools/AbstractMultiTool";
import { AbstractTool } from "../tools/AbstractTool";
import { XRState } from "./BabylonViewer";
import { Toolbar } from "./Toolbar";

/**
 * A XR GUI represents a toolbar useable in XR
 */
export class XrGui {
    xrGuiPanel: StackPanel;
    buttons: Map<AbstractTool, Button> = new Map();
    experience: BABYLON.WebXRDefaultExperience;
    buttonState: any = {};
    currentState: XRState;
    rightController: BABYLON.WebXRInputSource;
    leftController: BABYLON.WebXRInputSource;

    constructor(private toolbar: Toolbar, private scene: BABYLON.Scene, private instance: RealityBoxCollab) {
        this.createXRGui();
    }

    /**
     * Notifies this GUI of XR changes
     * @param state The new state of this instance 
     * @param experience Reference to the XR experience
     */
    onXRStateChanged(state: XRState, experience: BABYLON.WebXRDefaultExperience) {
        this.xrGuiPanel.isVisible = state != XRState.NONE;
        this.instance.drawTool.setPickerState(state != XRState.NONE);
        this.currentState = state;
        this.updatePanel();

        this.experience = experience;
        this.experience.input.onControllerAddedObservable.clear();

        this.experience.input.onControllerAddedObservable.add((evt) => {
            if (evt.inputSource.handedness === "right") {
                this.rightController = evt;
            }
            else if (evt.inputSource.handedness === "left") {
                this.leftController = evt;
            }
            this.initController(evt);
        });
    }

    /**
     * Called on the left and right controller as soon as they are added
     * @param controller The controller
     */
    private initController(controller: BABYLON.WebXRInputSource) {
        controller.onMotionControllerInitObservable.add((data, state) => {
            controller.motionController.getAllComponentsOfType("button").forEach(c => {
                c.onButtonStateChangedObservable.add((evt) => {
                    if (this.buttonState[c.id] != evt.pressed) {
                        this.onButtonStateChanged(c.id, evt.pressed, controller);
                    }
                    this.buttonState[c.id] = evt.pressed;
                });
            });
        });
    }

    /**
     * Called when a button of a controller has been changed
     * @param id The id of the button which has changed
     * @param down Whether the button is currently down
     * @param controller The controller with the button which has changed
     */
    private onButtonStateChanged(id: string, down: boolean, controller: BABYLON.WebXRInputSource) {
        if ((id === "b-button" || id === "y-button") && down) { // Cycle tools
            this.selectTool(false);
            this.updatePanel();
        }
        else if ((id === "a-button" || id === "x-button") && down) { // Cycle tools
            this.selectTool(true);
            this.updatePanel();
        }
    }

    /**
     * Get the current main controller
     * @returns The active controller
     */
    getActiveController(): BABYLON.WebXRInputSource {
        return this.rightController; // At the moment fixed at right controller
    }

    /**
     * Selects the next or previous tool (including subtools of {@link AbstractMultiTool})
     * @param forward If true, the next tool will be select, else the previous (loops back when reaching the first / last tool)
     */
    private selectTool(forward: boolean) {
        const offset = forward ? 1 : -1;
        let active = this.toolbar.activeTool;
        if (active instanceof AbstractMultiTool) {
            let subindex = active.subtools.indexOf(active.activeTool) + offset;
            if (subindex >= 0 && subindex < active.subtools.length) { // Not the last subtool was active
                active.toolClicked(active.subtools[subindex]);
                return;
            }
        }
        let index = this.toolbar.tools.indexOf(this.toolbar.activeTool) + offset;

        // No borders, cycle through
        if (index == this.toolbar.tools.length) index = 0;
        else if (index < 0) index = this.toolbar.tools.length - 1;

        this.toolbar.toolClicked(this.toolbar.tools[index]);

        if (!forward && this.toolbar.activeTool instanceof AbstractMultiTool) { // Select last subtool
            this.toolbar.activeTool.toolClicked(this.toolbar.activeTool.subtools[this.toolbar.activeTool.subtools.length - 1]);
        }
    }

    /**
     * Creates the fullscreen UI used to render the buttons for the toolbar
     */
    private createXRGui() {
        let xrGui = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene as any);
        this.xrGuiPanel = new StackPanel();
        this.xrGuiPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.xrGuiPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        xrGui.addControl(this.xrGuiPanel);

        this.xrGuiPanel.isVisible = true;//false;
    }

    /**
     * Create the buttons for a {@link AbstractTool}
     * @param tool The tool to create the buttons for
     * @returns One button for the tool itself and buttons for the subtools, if the tool is a {@link AbstractMultiTool} and currently active
     */
    private createTool(tool: AbstractTool): Button[] {
        let subs: Button[] = [];
        if (tool instanceof AbstractMultiTool && tool.active) {
            subs = tool.subtools.map(s =>
                this.createButton(s.name, tool.activeTool == s, () => {
                    tool.activeTool = s;
                    tool.onSubToolSwitched(s);
                    this.updatePanel();
                }));
            subs.forEach(b => b.left = "100px");
        }
        return [this.createButton(tool.name, tool.active, () => {
            this.toolbar.toolClicked(tool);
            this.updatePanel();
        }), ...subs];
    }

    /**
     * Create a button for a tool / subtool
     * @param name The name to display
     * @param active Whether the tool is currently active
     * @param callback The function called, when the button has been pressed
     * @returns The button instance
     */
    private createButton(name: string, active: boolean, callback: () => void): Button {
        var button = Button.CreateSimpleButton("but", name);
        button.width = this.currentState == XRState.AR ? 0.5 : 0.15;
        button.fontSize = this.currentState == XRState.AR ? "60px" : "30px";
        button.height = this.currentState == XRState.AR ? "120px" : "60px";
        button.background = "gray";
        button.paddingTop = "20px";
        button.color = active ? "red" : "black";
        button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        button.onPointerClickObservable.add(callback);
        return button;
    }

    /**
     * Updates the XR Gui with respect to the current {@link XRState}
     */
    private updatePanel() {
        this.xrGuiPanel.left = this.currentState == XRState.AR ? "20px" : "1000px";
        this.xrGuiPanel.top = this.currentState == XRState.AR ? "20px" : "500px";

        this.xrGuiPanel.clearControls();
        for (let tool of this.toolbar.tools) {
            this.createTool(tool).forEach(b => {
                this.buttons.set(tool, b);
                this.xrGuiPanel.addControl(b);
            });
        }
    }

}