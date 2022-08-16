import { AbstractMultiTool, SubTool } from "./AbstractMultiTool";
import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { RealityBoxCollab } from "../RealityboxCollab";

export class MoveTool extends AbstractMultiTool {

    gizmoManager: BABYLON.GizmoManager;

    constructor(private instance: RealityBoxCollab, container: JQuery) {
        super("Move Tool", "fa-solid fa-arrows-up-down-left-right",
            container,
            [
                { name: "Move", icon: "fa-solid fa-arrows-up-down-left-right" },
                { name: "Rotate", icon: "fa-solid fa-rotate" },
                { name: "Scale", icon: "fa-solid fa-maximize" }
            ],
            s => s.canUseMoveTool);
    }

    override onSubToolSwitched(tool: SubTool) {
        const scene: BABYLON.Scene = this.instance.realitybox.viewer._babylonBox.scene;

        if (!this.gizmoManager) this.gizmoManager = MoveTool.createGizmosManager(scene);

        // Select gizmo
        this.gizmoManager.positionGizmoEnabled = (tool == this.subtools[0]);
        this.gizmoManager.rotationGizmoEnabled = (tool == this.subtools[1]);
        this.gizmoManager.scaleGizmoEnabled = (tool == this.subtools[2]);

        // Sizes
        if (this.gizmoManager.gizmos.positionGizmo) this.modfiyGizmo(this.gizmoManager.gizmos.positionGizmo);
        if (this.gizmoManager.gizmos.rotationGizmo) this.modfiyGizmo(this.gizmoManager.gizmos.rotationGizmo);
        if (this.gizmoManager.gizmos.scaleGizmo) this.modfiyGizmo(this.gizmoManager.gizmos.scaleGizmo);
        this.modfiyGizmo(this.gizmoManager.gizmos.boundingBoxGizmo);

        // Attach to the base node
        this.gizmoManager.attachToNode(this.instance.babylonViewer.baseNode);
    }

    override onDeactivate() {
        super.onDeactivate();
        this.gizmoManager.attachToMesh(null);
    }

    override onRoomChanged() {

    }

    static createGizmosManager(scene: BABYLON.Scene): BABYLON.GizmoManager {
        let layer = new BABYLON.UtilityLayerRenderer(scene); // Fixes unknown bug in babylonjs
        let gizmoManager = new BABYLON.GizmoManager(scene, 1, layer, layer);
        gizmoManager.boundingBoxGizmoEnabled = true;
        gizmoManager.gizmos.boundingBoxGizmo.scaleBoxSize = 0.05;
        gizmoManager.usePointerToAttachGizmos = false; // Might be changed for multiple models
        return gizmoManager;
    }

    private modfiyGizmo(g: BABYLON.PositionGizmo | BABYLON.RotationGizmo | BABYLON.ScaleGizmo | BABYLON.BoundingBoxGizmo) {
        g.scaleRatio = 2;
    }

    isHovered(): boolean {
        if (!this.gizmoManager) return false;

        return this.gizmoManager.isHovered || this.instance.moveTool.gizmoManager.boundingBoxDragBehavior.dragging;
    }

}