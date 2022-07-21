import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import * as Y from 'yjs';
import { Popups } from "../gui/popup/Popups";
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
    annotations: Y.Map<RemoteAnnotation>;

    constructor(private instance: RealityBoxCollab, container: JQuery) {
        super("Annotation Tool", "fa-solid fa-note-sticky", container, [
            { name: "Move", icon: "fa-solid fa-arrows-up-down-left-right" },
            { name: "Duplicate", icon: "fa-solid fa-clone" },
            { name: "Delete", icon: "fa-solid fa-trash" }
        ], s => s.canUseAnnotationTool);

        this.instance.babylonViewer.scene.registerBeforeRender(() => {
            if (this.activeAnnotation && !Utils.vectorEquals(this.activeAnnotation.drawing.position, this.lastPosition)) {
                this.onPositionChanged();
                this.set(this.activeAnnotation);
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

        this.onChange();
        super.onActivate();
    }

    private processChanges() {
        if (!this.currentRoom.connected) return;

        const babylonBox = this.instance.babylonViewer.babylonBox;

        let local: RealityboxAnnotation[] = babylonBox.getAnnotations();
        local.forEach(a => {
            let remote = this.annotations.get(a.id);
            if (remote) {
                a.drawing.position = Utils.createVector(remote.position);
                a.position = Utils.createVector(remote.position);
            }
            else {
                babylonBox.removeAnnotation(a);
            }
        });

        this.annotations.forEach(a => { // Recreate all
            if (!local.find(x => x.id === a.id))
                babylonBox.addAnnotation(fromRemote(a));
        });
    }

    override onDeactivate(): void {
        (this.instance.babylonViewer.babylonBox as any).webXR.inWebXR = false;
        this.selectAnnotation(null);
        this.onChange();
        super.onDeactivate();
    }

    override onRoomChanged(): void {
        this.annotations = this.currentRoom.doc.getMap("annotations");
        if (this.currentRoom.isLocal) this.annotations.clear();

        if (this.currentRoom.user.role == Role.HOST) {
            for (let a of this.instance.babylonViewer.babylonBox.getAnnotations()) {
                a.id = this.generateId();
                this.set(a);
            }
        }
        else {
            let local: RealityboxAnnotation[] = this.instance.realitybox.viewer._babylonBox.getAnnotations();
            local.forEach(a => this.instance.realitybox.viewer._babylonBox.removeAnnotation(a));
        }
        this.annotations.observe((evt) => this.processChanges());
        this.processChanges();
    }

    onSubToolSwitched(subtool: SubTool): void {
        this.selectAnnotation(null);
        this.onChange();
    }

    private onAnnotationPicked(a: RealityboxAnnotation) {
        this.selectAnnotation(a);
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
                this.gizmoManager.boundingBoxGizmoEnabled = false;
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
                id: this.generateId(),
                drawing: undefined
            };
            this.set(n);
        }
        else if (this.activeTool == this.subtools[2]) { // Delete
            let selected = false;
            this.currentRoom.users.forEach((user) => {
                if (user.username !== this.currentRoom.user.username && user.selectedAnnotation
                    && user.selectedAnnotation.id == this.activeAnnotation.id)
                    selected = true;
            });
            if (selected) {
                Popups.alert("Cannot delete annotation. The annotation is locked by another user.");
                this.selectAnnotation(null);
                return;
            }

            Popups.confirm("Are you sure to delete this annotation for this room?", () => {
                this.delete(this.activeAnnotation);
                this.selectAnnotation(null);
            });
        }
    }

    private selectAnnotation(a: RealityboxAnnotation) {
        this.activeAnnotation = a;
        this.currentRoom.user.selectedAnnotation = a ? createRemote(a) : null;
        this.currentRoom.onUserUpdated();
    }

    private set(a: RealityboxAnnotation) {
        this.annotations.set(a.id, createRemote(a));
    }

    private delete(a: RealityboxAnnotation) {
        this.annotations.delete(a.id);
    }

    private onPositionChanged() {
        this.activeAnnotation.position = this.activeAnnotation.drawing.position;
        this.lastPosition = this.activeAnnotation.position.clone();
        this.set(this.activeAnnotation);
    }

    private generateId(): string {
        let id = null;
        do {
            id = Math.random() + ""; // Just some random string
        } while (this.annotations.get(id));
        return id;
    }
}

export interface RemoteAnnotation {
    content: any;
    position: BABYLON.Vector3;
    normal: BABYLON.Vector3;
    id: string;
}

function createRemote(a: RealityboxAnnotation): RemoteAnnotation {
    return {
        content: a.content,
        position: a.position,
        normal: a.normalRef,
        id: a.id
    };
}

function fromRemote(a: RemoteAnnotation): RealityboxAnnotation {
    return {
        content: a.content,
        position: Utils.createVector(a.position),
        normalRef: a.normal,
        drawing: undefined,
        id: a.id
    }
}