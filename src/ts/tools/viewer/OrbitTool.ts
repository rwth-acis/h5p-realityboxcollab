import { RealityBoxCollab } from "../../RealityboxCollab";
import { AbstractTool } from "../AbstractTool";
import * as BABYLON from "@babylonjs/core/Legacy/legacy";

export class OrbitTool extends AbstractTool {

    camera: BABYLON.ArcRotateCamera;
    inputDisabled: boolean = false;

    constructor(private instance: RealityBoxCollab) {
        super("Orbit Tool", "fa-solid fa-circle-notch");
        this.camera = this.instance.babylonViewer.scene.cameras[0] as BABYLON.ArcRotateCamera;

        // Avoid camera input when inactive (even setEnabled does not disable input)
        this.disableInput();
    }

    /**
     * Reenables the input of the camera
     */
    override onActivate(): void {
        if (!this.inputDisabled) this.enableInput();
    }

    /**
     * Disables the input of the camera, so it does nopt move while other tools / cameras are used
     */
    override onDeactivate(): void {
        this.disableInput();
    }

    override onRoomChanged(): void { }

    disableInput(): void {
        (this.camera.inputs.attached.pointers as any).buttons = [];
    }

    forceDisableInput(): void {
        this.inputDisabled = true;
        this.disableInput();
    }

    enableInput(): void {
        this.inputDisabled = false;
        (this.camera.inputs.attached.pointers as any).buttons = [0, 1, 2];
    }

}