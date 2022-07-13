import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import * as Y from 'yjs';
import { Role } from "../networking/Room";
import { RealityBoxCollab } from "../RealityboxCollab";
import { RealityboxAnnotation } from "../RealityboxTypes";
import { Utils } from "../utils/Utils";
import { AbstractMultiTool, SubTool } from "./AbstractMultiTool";
import { MoveTool } from "./MoveTool";

export class AnnotationTool extends AbstractMultiTool {

    callbackRegistered: boolean = false;
    activeAnnotation: RealityboxAnnotation;
    gizmoManager: BABYLON.GizmoManager;
    lastPosition: BABYLON.Vector3;
    annotations: Y.Array<RemoteAnnotation>;
    ownChange: boolean = false;

    constructor(private instance: RealityBoxCollab, container: JQuery) {
        super("Annotation Tool", "fa-solid fa-note-sticky", container, [
            { name: "Move", icon: "fa-solid fa-arrows-up-down-left-right" },
            { name: "Duplicate", icon: "fa-solid fa-clone" },
            { name: "Delete", icon: "fa-solid fa-trash" }
        ], s => s.canUseAnnotationTool);

        this.instance.babylonViewer.scene.registerBeforeRender(() => {
            if (this.activeAnnotation && !Utils.vectorEquals(this.activeAnnotation.drawing.position, this.lastPosition)) {
                this.onPositionChanged();
            }
        });
    }

    override onActivate(): void {
        const babylonBox = this.instance.babylonViewer.babylonBox;

        // Prevent default behavior (RealityBoxs WebXR is not used anyway)
        babylonBox.webXR.inWebXR = true;
        if (!this.callbackRegistered) {
            babylonBox.on('annotation picked', (a: any) => { if (this.active) this.onAnnotationPicked(a.data) });
            this.callbackRegistered = true;
        }

        this.annotations.observe((evt) => {
            if (!this.ownChange) this.recreateAll();

            this.ownChange = false;
        });

        this.onChange();
        super.onActivate();
    }

    private recreateAll() {
        const babylonBox = this.instance.babylonViewer.babylonBox;

        babylonBox.getAnnotations().forEach(a => babylonBox.removeAnnotation(a)); // Remove all
        this.annotations.forEach(a => babylonBox.addAnnotation(fromRemote(a))); // Recreate all
    }

    override onDeactivate(): void {
        (this.instance.babylonViewer.babylonBox as any).webXR.inWebXR = false;
        this.activeAnnotation = null;
        this.onChange();
        super.onDeactivate();
    }

    override onRoomChanged(): void {
        this.annotations = this.currentRoom.doc.getArray("annotations");
        if (this.currentRoom.user.role == Role.HOST) {
            this.annotations.push(this.instance.babylonViewer.babylonBox.getAnnotations().map(a => createRemote(a)));
        }
        this.recreateAll();
    }

    onSubToolSwitched(subtool: SubTool): void {
        this.activeAnnotation = null;
        this.onChange();
    }

    private onAnnotationPicked(a: RealityboxAnnotation) {
        this.activeAnnotation = a;
        this.lastPosition = a.drawing.position.clone();
        this.onChange();
    }

    private onChange() {
        // Reset 
        if (this.gizmoManager) this.gizmoManager.attachToMesh(null);

        if (!this.activeAnnotation) return;

        // Select tool
        if (this.activeTool == this.subtools[0]) { // Move
            if (!this.gizmoManager) {
                this.gizmoManager = MoveTool.createGizmosManager(this.instance.babylonViewer.scene);
                this.gizmoManager.boundingBoxGizmoEnabled = true;
            }

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
            this.add(n);
        }
        else if (this.activeTool == this.subtools[2]) { // Delete
            if (confirm("Are you sure to delete this annotation for this room?")) {
                this.delete(this.activeAnnotation);
                this.activeAnnotation = null;
            }
        }
    }

    private add(a: RealityboxAnnotation) {
        this.annotations.push([createRemote(a)]);
    }

    private delete(a: RealityboxAnnotation) {
        let index = -1, x = 0;
        this.annotations.forEach(a => {
            if (remoteEquals(a, this.activeAnnotation)) {
                index = x;
            }
            x++;
        });
        console.log(index);
        console.log(this.annotations.length);
        this.annotations.delete(index);
        console.log(this.annotations.length);
    }

    private onPositionChanged() {
        this.activeAnnotation.position = this.activeAnnotation.drawing.position;
        this.lastPosition = this.activeAnnotation.position.clone();
        this.delete(this.activeAnnotation);
        this.add(this.activeAnnotation);
        this.ownChange = true;
        console.log(this.activeAnnotation.position);
    }
}

interface RemoteAnnotation {
    content: any;
    position: BABYLON.Vector3;
    normal: BABYLON.Vector3;
}

function createRemote(a: RealityboxAnnotation): RemoteAnnotation {
    return {
        content: a.content,
        position: a.position,
        normal: a.normalRef
    };
}

function fromRemote(a: RemoteAnnotation): RealityboxAnnotation {
    return {
        content: a.content,
        position: Utils.createVector(a.position),
        normalRef: a.normal,
        drawing: undefined
    }
}

function remoteEquals(remote: RemoteAnnotation, local: RealityboxAnnotation) {
    return remote.content === local.content && Utils.vectorEquals(remote.position, local.position);
}
