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

    /**
     * Construct an AnnotationTool
     * @param instance The main instance of RealityboxCollab 
     * @param container The container for the multi tool
     */
    constructor(private instance: RealityBoxCollab, container: JQuery) {
        super("Annotation Tool", "fa-solid fa-note-sticky", container, [
            { name: "Move", icon: "fa-solid fa-arrows-up-down-left-right" },
            { name: "Duplicate", icon: "fa-solid fa-clone" },
            { name: "Delete", icon: "fa-solid fa-trash" }
        ], s => s.canUseAnnotationTool);

        this.instance.babylonViewer.scene.registerBeforeRender(() => {
            // Listen for position changes through the gizmos on the active annotation
            if (this.activeAnnotation && !Utils.vectorEquals(this.activeAnnotation.drawing.position, this.lastPosition)) {
                this.onPositionChanged();
                this.updateAnnotation(this.activeAnnotation);
            }
        });
    }

    override onActivate() {
        const babylonBox = this.instance.babylonViewer.babylonBox;

        // Prevent default behavior (RealityBox's WebXR is not used anyway)
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

    override onDeactivate() {
        this.instance.babylonViewer.babylonBox.webXR.inWebXR = false;
        this.selectAnnotation(null);
        this.onChange();
        super.onDeactivate();
    }

    /**
     * If host, copy annotations, else clear all existing
     */
    override onRoomChanged() {
        this.annotations = this.currentRoom.doc.getMap("annotations");
        if (this.currentRoom.isLocal) this.annotations.clear();

        if (this.currentRoom.user.role == Role.HOST) {
            for (let a of this.instance.babylonViewer.babylonBox.getAnnotations()) {
                a.id = this.generateId();
                this.updateAnnotation(a);
            }
        }
        else {
            let local: RealityboxAnnotation[] = this.instance.realitybox.viewer._babylonBox.getAnnotations();
            local.forEach(a => this.instance.realitybox.viewer._babylonBox.removeAnnotation(a));
        }
        this.annotations.observe((evt) => this.processChanges());
        this.processChanges();
    }

    /**
     * Deselects the selected annotation
     * @param subtool The new subtool
     */
    onSubToolSwitched(subtool: SubTool) {
        this.selectAnnotation(null);
        this.onChange();
    }

    /**
     * Event handler, called when a annotation has been picked by the user
     * @param a The picked annotation
     */
    private onAnnotationPicked(a: RealityboxAnnotation) {
        this.selectAnnotation(a);
        this.lastPosition = a.drawing.position.clone();
        this.onChange();
    }

    /**
     * Called when clicking on an annotation or deselecting it. Handles subtool functionality 
     */
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
            this.updateAnnotation(n);
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

    /**
     * Select a annotation and propagate it to the other users of the room
     * @param a The annotation to select
     */
    private selectAnnotation(a: RealityboxAnnotation) {
        this.activeAnnotation = a;
        this.currentRoom.user.selectedAnnotation = a ? createRemote(a) : null;
        this.currentRoom.onUserUpdated();
    }

    /**
     * Update a annotations remote state for the other users
     * @param a The annotation to update
     */
    private updateAnnotation(a: RealityboxAnnotation) {
        this.annotations.set(a.id, createRemote(a));
    }

    /**
     * Delete a annotation
     * @param a The annotation to delete
     */
    private delete(a: RealityboxAnnotation) {
        this.annotations.delete(a.id); // Will be removed in babylonbox due to change event
    }

    /**
     * Called when the select annotation changes its position
     */
    private onPositionChanged() {
        this.activeAnnotation.position = this.activeAnnotation.drawing.position;
        this.lastPosition = this.activeAnnotation.position.clone();
        this.updateAnnotation(this.activeAnnotation);
    }

    /**
     * Generate a random id. It is made sure that the id is not assigned to an annotation yet.
     * @returns The generated id
     */
    private generateId(): string {
        let id = null;
        do {
            id = Math.random() + ""; // Just some random string
        } while (this.annotations.get(id));
        return id;
    }
}

/**
 * Represents an annotation exchanged via yjs
 */
export interface RemoteAnnotation {
    content: any;
    position: BABYLON.Vector3;
    normal: BABYLON.Vector3;
    id: string;
}

/**
 * Convert a visual annotation to its remote object
 * @param a The annotation from babylonbox
 * @returns The remote representation
 */
function createRemote(a: RealityboxAnnotation): RemoteAnnotation {
    return {
        content: a.content,
        position: a.position,
        normal: a.normalRef,
        id: a.id
    };
}

/**
 * Convert a remote annotation to its babylonbox object
 * @param a The annotation exchanged via yjs
 * @returns The visual annotation, which can be added to babylonbox
 */
function fromRemote(a: RemoteAnnotation): RealityboxAnnotation {
    return {
        content: a.content,
        position: Utils.createVector(a.position),
        normalRef: a.normal,
        drawing: undefined,
        id: a.id
    }
}