import { RealityBoxCollab } from "../RealityboxCollab";
import { AbstractTool } from "./AbstractTool";

export class PointerTool extends AbstractTool {

    static readonly LINE_COLOR = new BABYLON.Color4(1, 0, 0);

    line: BABYLON.Mesh;
    sphere: BABYLON.Mesh;
    mat: BABYLON.StandardMaterial;

    constructor() {
        super("Pointer Tool", "fa-solid fa-person-chalkboard");

        this.mat = new BABYLON.StandardMaterial("matPointerBall", RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene);
        this.mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
    }

    onActivate(): void {
        const scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;
        scene
            .registerBeforeRender(() => {
                const cam = scene.activeCamera;
                let pos = cam.position.clone();
                pos.y -= 1.4;

                // https://doc.babylonjs.com/divingDeeper/mesh/interactions/picking_collisions
                let hit = scene.pickWithRay(new BABYLON.Ray(cam.position, cam.getDirection(BABYLON.Vector3.Forward())),
                    mesh => RealityBoxCollab.instance.realitybox.viewer._babylonBox.model.env.getChildMeshes().find(c => c == mesh) != undefined);
                let target;
                if (hit) {
                    target = hit.pickedPoint;
                }

                if (!target) {
                    target = pos;
                }

                this.line = BABYLON.MeshBuilder.CreateTube("tube", {
                    path: [pos, target],
                    radius: 0.1,
                    updatable: true,
                    instance: this.line
                }, scene);
                this.line.material = this.mat;
                if (!this.sphere) {
                    this.sphere = BABYLON.MeshBuilder.CreateSphere("pointerBall", {
                        diameter: 3
                    }, scene);

                    this.sphere.material = this.mat;
                }
                this.sphere.position.set(target.x, target.y, target.z);
            });
    }

    onDeactivate(): void {
        if (this.line) {
            RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene.removeMesh(this.line);
            RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene.removeMesh(this.sphere);
        }
    }

    onRoomChanged(): void {

    }

    canActivate(): boolean {
        return true; // Temp
    }
}