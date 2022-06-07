import { RealityBoxCollab } from "../RealityboxCollab";
import { AbstractMultiTool, SubTool } from "./AbstractMultiTool";

export class MoveTool extends AbstractMultiTool {

    gizmoManager: BABYLON.GizmoManager;

    constructor(container: JQuery) {
        super("Move Tool", "fa-solid fa-arrows-up-down-left-right",
            container,
            [
                { name: "Move", icon: "fa-solid fa-arrows-up-down-left-right" },
                { name: "Rotate", icon: "fa-solid fa-rotate" },
                { name: "Scale", icon: "fa-solid fa-maximize" }
            ],
            s => s.canUseMoveTool);
    }

    override onSubToolSwitched(tool: SubTool): void {
        const scene: BABYLON.Scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;
        const mesh: BABYLON.Mesh = RealityBoxCollab.instance.realitybox.viewer._babylonBox.model.env;

        if (!this.gizmoManager) {
            this.gizmoManager = new BABYLON.GizmoManager(scene);
            this.gizmoManager.boundingBoxGizmoEnabled = true;
            this.gizmoManager.usePointerToAttachGizmos = false; // Might be changed for multiple models
        }

        this.gizmoManager.positionGizmoEnabled = (tool == this.subtools[0]);
        this.gizmoManager.rotationGizmoEnabled = (tool == this.subtools[1]);
        this.gizmoManager.scaleGizmoEnabled = (tool == this.subtools[2]);
        this.gizmoManager.attachToMesh(mesh);
    }

    override onDeactivate(): void {
        super.onDeactivate();
        this.gizmoManager.attachToMesh(null);
    }

    override onRoomChanged(): void {

    }

}