import { User } from "../networking/Room";
import { RealityBoxCollab } from "../RealityboxCollab";
import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { Utils } from "../utils/Utils";
import { AbstractMultiTool, SubTool } from "./AbstractMultiTool";

export class PointerTool extends AbstractMultiTool {
    
    static readonly LINE_COLOR = new BABYLON.Color4(1, 0, 0);

    mat: BABYLON.StandardMaterial;
    pointers: Map<string, Pointer> = new Map<string, Pointer>();

    constructor(container: JQuery) {
        super("Pointer Tool", "fa-solid fa-person-chalkboard", container, [
            {name: "Pointer", icon: "fa-solid fa-arrow-pointer"},
            {name: "View", icon: "fa-solid fa-eye"}
        ], s => s.canUsePointerTool);

        this.mat = new BABYLON.StandardMaterial("matPointerBall", RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene);
        this.mat.diffuseColor = new BABYLON.Color3(1, 0, 0);

        const scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;
        scene.registerBeforeRender(() => {
            this.onRender(scene);
        });
    }

    onSubToolSwitched(subtool: SubTool): void {
        
    }

    private onRender(scene: BABYLON.Scene) {
        if (this.active) {
            this.updateOwnPointer(scene);
        }

        this.currentRoom.users.forEach((user: User, username: string) => {
            let pointer = this.pointers.get(username);

            if (user.pointer) {
                // Create Pointer
                if (!pointer) this.pointers.set(username, pointer = new Pointer(this.mat, scene));

                pointer.update(user.pointer);
            }
            else if (pointer) {
                this.pointers.delete(username);
                pointer.removeFromScene();
            }
        });

        if (this.pointers.size != this.currentRoom.users.size) {
            this.pointers.forEach((p, username) => {
                if (!this.currentRoom.users.get(username)) {
                    p.removeFromScene();
                    this.pointers.delete(username);
                }
            });
        }
    }

    private updateOwnPointer(scene: BABYLON.Scene): void {
        const cam = scene.activeCamera;
        const model = RealityBoxCollab.instance.realitybox.viewer._babylonBox.model.env;

        let pos = cam.position.clone();
        pos.y -= RealityBoxCollab.instance.babylonViewer.isInXR ? 0.5 : 1.4;
        let hit: BABYLON.PickingInfo;
        if (this.activeTool == this.subtools[0]) {
            hit = scene.pick(scene.pointerX, scene.pointerY, mesh => model.getChildMeshes().find(c => c == mesh) != undefined);
        }
        else {
            hit = scene.pickWithRay(new BABYLON.Ray(cam.position, cam.getDirection(BABYLON.Vector3.Forward())),
                mesh => model.getChildMeshes().find(c => c == mesh) != undefined);
        }
        let target;
        if (hit) target = hit.pickedPoint;
        if (!target) target = pos;

        let info = {
            pos: pos,
            target: target,
            active: hit.pickedPoint != undefined
        }
        this.currentRoom.user.pointer = info;
        this.currentRoom.onUserUpdated();
    }

    override onDeactivate(): void {
        if (this.currentRoom) {
            this.currentRoom.user.pointer = undefined;
            this.currentRoom.onUserUpdated();
        }
        super.onDeactivate();
    }

    override onRoomChanged(): void {
        this.pointers.forEach(p => p.removeFromScene());
        this.pointers.clear();
    }

}

export interface PointerInfo {
    pos: BABYLON.Vector3;
    target: BABYLON.Vector3;
    active: boolean;
}

class Pointer {
    line: BABYLON.Mesh;
    sphere: BABYLON.Mesh;

    constructor(private mat: BABYLON.Material, private scene: BABYLON.Scene) {
        this.sphere = BABYLON.MeshBuilder.CreateSphere("pointerBall", {
            diameter: 0.05
        }, scene);
        this.sphere.setParent(RealityBoxCollab.instance.babylonViewer.baseNode);
        this.sphere.material = this.mat;
    }

    update(info: PointerInfo): void {
        if (this.line) this.line.setEnabled(info.active);
        this.sphere.setEnabled(info.active);
        if (!info.active) return;

        this.line = BABYLON.MeshBuilder.CreateTube("tube", {
            path: [Utils.createVector(info.pos), Utils.createVector(info.target)],
            radius: 0.005,
            updatable: true,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE,
            instance: this.line
        }, this.scene);
        this.line.setParent(RealityBoxCollab.instance.babylonViewer.baseNode);
        this.line.material = this.mat;

        let target = Utils.createVector(info.target);
        this.sphere.position.set(target.x, target.y, target.z);
    }

    removeFromScene(): void {
        this.scene.removeMesh(this.line);
        this.scene.removeMesh(this.sphere);
    }
}