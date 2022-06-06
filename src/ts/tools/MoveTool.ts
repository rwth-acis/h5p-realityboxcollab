import { GizmoManager } from "babylonjs";
import { RealityBoxCollab } from "../RealityboxCollab";
import { BabylonBox } from "../RealityboxTypes";
import { AbstractMultiTool, SubTool } from "./AbstractMultiTool";

export class MoveTool extends AbstractMultiTool {

    gizmoManager: GizmoManager;

    constructor(container: JQuery) {
        super("Move Tool", "fa-solid fa-arrows-up-down-left-right",
        container,
            [
                { name: "Move", icon: "fa-solid fa-arrows-up-down-left-right" },
                { name: "Rotate", icon: "fa-solid fa-rotate" },
                { name: "Scale", icon: "fa-solid fa-maximize" }
            ]);
    }

    override onSubToolSwitched(tool: SubTool): void {
        const babylonBox: BabylonBox = RealityBoxCollab.instance.realitybox.viewer._babylonBox;
        if (!this.gizmoManager) {
            this.gizmoManager = new GizmoManager(babylonBox.scene);
            this.gizmoManager.boundingBoxGizmoEnabled = true;
            this.gizmoManager.usePointerToAttachGizmos = false;
        }

        this.gizmoManager.positionGizmoEnabled = (tool == this.subtools[0]);
        this.gizmoManager.rotationGizmoEnabled = (tool == this.subtools[1]);
        this.gizmoManager.scaleGizmoEnabled = (tool == this.subtools[2]);
        this.gizmoManager.attachToMesh(babylonBox.model.env);
    }

    override onDeactivate(): void {
        super.onDeactivate();
        this.gizmoManager.attachToMesh(null);
    }

    override onRoomChanged(): void {

    }

}