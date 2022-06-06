import { Color3, Color4, Material, Mesh, MeshBuilder, Ray, Scene, StandardMaterial, Vector3 } from "babylonjs";
import { User } from "../networking/Room";
import { RealityBoxCollab } from "../RealityboxCollab";
import { AbstractTool } from "./AbstractTool";

export class PointerTool extends AbstractTool {

    static readonly LINE_COLOR = new Color4(1, 0, 0);

    mat: StandardMaterial;
    pointers: Map<string, Pointer> = new Map<string, Pointer>();

    constructor() {
        super("Pointer Tool", "fa-solid fa-person-chalkboard");

        this.mat = new StandardMaterial("matPointerBall", RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene);
        this.mat.diffuseColor = new Color3(1, 0, 0);

        const scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;
        scene.registerBeforeRender(() => {
            this.onRender(scene);
        });
    }

    override onActivate(): void {

    }

    private onRender(scene: Scene) {
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

    private updateOwnPointer(scene: Scene): void {
        const cam = scene.activeCamera;
        const model = RealityBoxCollab.instance.realitybox.viewer._babylonBox.model.env;

        let pos = cam.position.clone();
        pos.y -= 1.4;
        let hit = scene.pickWithRay(new Ray(cam.position, cam.getDirection(Vector3.Forward())),
            mesh => model.getChildMeshes().find(c => c == mesh) != undefined);
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
    }

    override onRoomChanged(): void {
        this.pointers.forEach(p => p.removeFromScene());
        this.pointers.clear();
    }

}

export interface PointerInfo {
    pos: Vector3;
    target: Vector3;
    active: boolean;
}

class Pointer {
    line: Mesh;
    sphere: Mesh;

    constructor(private mat: Material, private scene: Scene) {
        this.sphere = MeshBuilder.CreateSphere("pointerBall", {
            diameter: 3
        }, scene);
        this.sphere.material = this.mat;
    }

    update(info: PointerInfo): void {
        if (this.line) this.line.setEnabled(info.active);
        this.sphere.setEnabled(info.active);
        if (!info.active) return;

        this.line = MeshBuilder.CreateTube("tube", {
            path: [createVector(info.pos), createVector(info.target)],
            radius: 0.1,
            updatable: true,
            instance: this.line
        }, this.scene);
        this.line.material = this.mat;

        let target = createVector(info.target);
        this.sphere.position.set(target.x, target.y, target.z);
    }

    removeFromScene(): void {
        this.scene.removeMesh(this.line);
        this.scene.removeMesh(this.sphere);
    }
}

/**
 * Only _x, _y and _z will be exchanged via yjs
 * @param vec The vector exchanged via yjs
 * @returns A proper Vector3 instance
 */
export function createVector(vec: Vector3): Vector3 {
    return new Vector3(vec._x, vec._y, vec._z);
}