import { RealityBoxCollab } from "../RealityboxCollab";
import { BabylonBox } from "../RealityboxTypes";
import { AbstractTool } from "./AbstractTool";

export class MoveTool extends AbstractTool {

    gizmoManager: BABYLON.GizmoManager;

    constructor() {
        super("Move Tool", "fa-solid fa-arrows-up-down-left-right");
    }

    onActivate(): void { // Not working after reenabling
        const babylonBox: BabylonBox = RealityBoxCollab.instance.realitybox.viewer._babylonBox;
        this.gizmoManager = new BABYLON.GizmoManager(babylonBox.scene);
        this.gizmoManager.positionGizmoEnabled = true;
        this.gizmoManager.rotationGizmoEnabled = true;
        this.gizmoManager.scaleGizmoEnabled = true;
        this.gizmoManager.boundingBoxGizmoEnabled = true;
        this.gizmoManager.attachableMeshes = [babylonBox.model.env];
    }

    onDeactivate(): void {
        this.gizmoManager.dispose();
    }

    onRoomChanged(): void {

    }
}