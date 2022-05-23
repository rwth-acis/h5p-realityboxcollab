import { RealityBoxCollab } from "../RealityboxCollab";
import { BabylonBox } from "../RealityboxTypes";
import { AbstractTool } from "./AbstractTool";

export class MoveTool extends AbstractTool {

    gizmoManager: BABYLON.GizmoManager;

    constructor() {
        super("Move Tool", "fa-solid fa-arrows-up-down-left-right");
    }

    onActivate(): void {
        const babylonBox: BabylonBox = RealityBoxCollab.instance.realitybox.viewer._babylonBox;
        if (!this.gizmoManager) {
            this.gizmoManager = new BABYLON.GizmoManager(babylonBox.scene);
            this.gizmoManager.positionGizmoEnabled = true;
            this.gizmoManager.rotationGizmoEnabled = true;
            this.gizmoManager.scaleGizmoEnabled = false;

            this.gizmoManager.boundingBoxGizmoEnabled = true;
            this.gizmoManager.usePointerToAttachGizmos = false;
        }
        this.gizmoManager.attachToMesh(babylonBox.model.env);
    }

    onDeactivate(): void {
        this.gizmoManager.attachToMesh(null);
    }

    onRoomChanged(): void {

    }
}