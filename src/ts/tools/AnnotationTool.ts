import { RealityBoxCollab } from "../RealityboxCollab";
import { RealityboxAnnotation } from "../RealityboxTypes";
import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { AbstractMultiTool, SubTool } from "./AbstractMultiTool";
import { MoveTool } from "./MoveTool";

export class AnnotationTool extends AbstractMultiTool {

    callbackRegistered: boolean = false;
    activeAnnotation: RealityboxAnnotation;
    gizmoManager: BABYLON.GizmoManager;

    constructor(private instance: RealityBoxCollab, container: JQuery) {
        super("Annotation Tool", "fa-solid fa-note-sticky", container, [
            { name: "Move", icon: "fa-solid fa-arrows-up-down-left-right" },
            { name: "Duplicate", icon: "fa-solid fa-clone" },
            { name: "Delete", icon: "fa-solid fa-trash" }
        ], s => s.canUseAnnotationTool);
    }

    override onActivate(): void {
        const babylonBox = this.instance.babylonViewer.babylonBox;

        // Prevent default behavior (RealityBoxs WebXR is not used anyway)
        babylonBox.webXR.inWebXR = true;
        if (!this.callbackRegistered) {
            babylonBox.on('annotation picked', (a: any) => { if (this.active) this.onAnnotationPicked(a.data) });
            this.callbackRegistered = true;
        }
        this.onChange();
        super.onActivate();
    }

    override onDeactivate(): void {
        (this.instance.babylonViewer.babylonBox as any).webXR.inWebXR = false;
        this.activeAnnotation = null;
        this.onChange();
        super.onDeactivate();
    }

    override onRoomChanged(): void {

    }

    onSubToolSwitched(subtool: SubTool): void {
        this.activeAnnotation = null;
        this.onChange();
    }

    private onAnnotationPicked(a: RealityboxAnnotation) {
        this.activeAnnotation = a;
        this.onChange();
    }

    private onChange() {
        // Reset 
        if (this.gizmoManager) this.gizmoManager.attachToMesh(null);

        if (!this.activeAnnotation) return;

        // Select tool
        if (this.activeTool == this.subtools[0]) { // Move
            if (!this.gizmoManager) this.gizmoManager = MoveTool.createGizmosManager(this.instance.babylonViewer.scene);

            this.gizmoManager.positionGizmoEnabled = true;
            this.gizmoManager.gizmos.positionGizmo.scaleRatio = 2;
            this.gizmoManager.attachToMesh(this.activeAnnotation.drawing);
        }
        else if (this.activeTool == this.subtools[1]) { // Duplicate
            let n: RealityboxAnnotation = {
                content: this.activeAnnotation.content,
                position: this.activeAnnotation.drawing.position.add(new BABYLON.Vector3(0, 0.2, 0)),
                normalRef: this.activeAnnotation.normalRef,
                drawing: undefined
            };
            this.instance.realitybox.viewer._babylonBox.addAnnotation(n);
        }
        else if (this.activeTool == this.subtools[2]) { // Delete
            if (confirm("Are you sure to delete this annotation for this room?")) {
                this.instance.realitybox.viewer._babylonBox.removeAnnotation(this.activeAnnotation);
            }
        }
    }

}