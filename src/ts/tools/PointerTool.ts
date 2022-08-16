import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { BabylonViewer } from "../gui/BabylonViewer";
import { User } from "../networking/Room";
import { RealityBoxCollab } from "../RealityboxCollab";
import { Utils } from "../utils/Utils";
import { AbstractMultiTool, SubTool } from "./AbstractMultiTool";

export class PointerTool extends AbstractMultiTool {

    /**
     * The color to be used for the pointer line and sphere
     */
    static readonly LINE_COLOR = new BABYLON.Color4(1, 0, 0);

    /** The material for the pointer */
    mat: BABYLON.StandardMaterial;
    /** Maps the usernames to the pointer instances */
    pointers: Map<string, Pointer> = new Map<string, Pointer>();

    constructor(private instance: RealityBoxCollab, container: JQuery) {
        super("Pointer Tool", "fa-solid fa-person-chalkboard", container, [
            { name: "Pointer", icon: "fa-solid fa-arrow-pointer" },
            { name: "View", icon: "fa-solid fa-eye" }
        ], s => s.canUsePointerTool);

        this.mat = new BABYLON.StandardMaterial("matPointerBall", this.instance.realitybox.viewer._babylonBox.scene);
        this.mat.diffuseColor = new BABYLON.Color3(1, 0, 0);

        const scene = this.instance.realitybox.viewer._babylonBox.scene;
        scene.registerBeforeRender(() => {
            this.onRender(scene);
        });
    }

    override onSubToolSwitched(subtool: SubTool) {

    }

    /**
     * Called every frame, independent of whether this tool is active or not. If the tool is active, the users pointer is updated.
     * In any case, the pointers of the other users are updated.  
     * @param scene The babylonjs scene
     */
    private onRender(scene: BABYLON.Scene) {
        if (this.active) this.updateOwnPointer(scene);

        // Update pointers
        this.currentRoom.users.forEach((user: User, username: string) => {
            let pointer = this.pointers.get(username);

            if (user.pointer) {
                // Create pointer
                if (!pointer) this.pointers.set(username, pointer = new Pointer(this.instance.babylonViewer, this.mat, scene));

                pointer.update(user.pointer, username === this.currentRoom.user.username);
            }
            else if (pointer) { // Remove cached pointer
                this.pointers.delete(username);
                pointer.removeFromScene();
            }
        });

        // Remove unused pointer instances
        if (this.pointers.size != this.currentRoom.users.size) {
            this.pointers.forEach((p, username) => {
                if (!this.currentRoom.users.get(username)) {
                    p.removeFromScene();
                    this.pointers.delete(username);
                }
            });
        }
    }

    /**
     * Updates the pointer of this user
     * @param scene The babylon scene of this instance
     */
    private updateOwnPointer(scene: BABYLON.Scene) {
        const cam = scene.activeCamera;
        const model = this.instance.realitybox.viewer._babylonBox.model.env;

        let pos = cam.position.clone();
        let hit: BABYLON.PickingInfo;
        if (this.activeTool == this.subtools[0]) {
            hit = this.instance.inputManager.pickWithPointer();
        }
        else {
            hit = scene.pickWithRay(new BABYLON.Ray(cam.position, cam.getDirection(BABYLON.Vector3.Forward())),
                mesh => model.getChildMeshes().find(c => c == mesh) != undefined);
        }
        let target;
        if (hit) target = hit.pickedPoint;
        if (!target) target = pos;

        let info = {
            pos: Utils.getRelativePosition(this.instance.babylonViewer, pos),
            target: Utils.getRelativePosition(this.instance.babylonViewer, target),
            active: hit.pickedPoint != undefined
        }
        this.currentRoom.user.pointer = info;
        this.currentRoom.onUserUpdated();
    }

    /**
     * Removes the users pointer
     */
    override onDeactivate() {
        this.currentRoom.user.pointer = undefined;
        this.currentRoom.onUserUpdated();
        super.onDeactivate();
    }

    /**
     * Removes all pointers
     */
    override onRoomChanged() {
        this.pointers.forEach(p => p.removeFromScene());
        this.pointers.clear();
    }

}

/**
 * Information about the current state of a pointer, exchanged via yjs
 */
export interface PointerInfo {
    pos: BABYLON.Vector3;
    target: BABYLON.Vector3;
    active: boolean;
}

/**
 * Represents the visual pointer for the {@link PointerTool}
 */
class Pointer {
    line: BABYLON.Mesh;
    sphere: BABYLON.Mesh;

    /**
     * Create an instance of a pointer which consists of a line and a sphere
     * @param babylonViewer The babylonviewer instance to get the base node
     * @param mat The material to use for the pointer
     * @param scene The scene of the instance
     */
    constructor(private babylonViewer: BabylonViewer, private mat: BABYLON.Material, private scene: BABYLON.Scene) {
        this.sphere = BABYLON.MeshBuilder.CreateSphere("pointerBall", {
            diameter: 0.05
        }, scene);
        this.sphere.material = this.mat;
    }

    /**
     * Update the pointer
     * @param info The pointer info of the pointer to update
     * @param self If true, the pointer will be slightly lower to look better from the users position
     */
    update(info: PointerInfo, self: boolean) {
        if (this.line) this.line.setEnabled(info.active);
        this.sphere.setEnabled(info.active);
        if (!info.active) return;

        let pos = Utils.createVector(info.pos);
        if (self) pos.y -= 0.2;

        this.line = BABYLON.MeshBuilder.CreateTube("tube", {
            path: [pos, Utils.createVector(info.target)],
            radius: 0.005,
            updatable: true,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE,
            instance: this.line
        }, this.scene);
        this.line.parent = this.babylonViewer.baseNode;
        this.line.material = this.mat;

        this.sphere.parent = this.babylonViewer.baseNode;
        this.sphere.position = Utils.createVector(info.target);
    }

    /**
     * Remove the meshes from the scene
     */
    removeFromScene() {
        this.scene.removeMesh(this.line);
        this.scene.removeMesh(this.sphere);
    }
}