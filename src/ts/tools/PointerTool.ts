import { RealityBoxCollab } from "../RealityboxCollab";
import { AbstractTool } from "./AbstractTool";

export class PointerTool extends AbstractTool {

    static readonly LINE_COLOR = new BABYLON.Color4(1, 0, 0);

    line: BABYLON.LinesMesh;
    sphere: BABYLON.Mesh;

    constructor() {
        super("Pointer Tool", "fa-solid fa-person-chalkboard");
    }

    onActivate(): void {
        const scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;
        scene
            .registerBeforeRender(() => {
                const cam = scene.activeCamera;
                let pos = cam.position.clone();
                pos.y -= 0.4;

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

                this.line = BABYLON.MeshBuilder.CreateLines("pointer", {
                    points: [pos, target],
                    updatable: true,
                    colors: [PointerTool.LINE_COLOR, PointerTool.LINE_COLOR],
                    instance: this.line // Update this line, instead of creating new
                }, scene);
                if (!this.sphere) {
                    this.sphere = BABYLON.MeshBuilder.CreateSphere("pointerBall", {
                        diameter: 3
                    }, scene);

                    let mat = new BABYLON.StandardMaterial("matPointerBall", scene);
                    mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
                    this.sphere.material = mat;
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