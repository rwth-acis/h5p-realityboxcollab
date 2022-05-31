import { RealityBoxCollab } from "../RealityboxCollab";
import { AbstractTool } from "./AbstractTool";

export class PointerTool extends AbstractTool {

    static readonly LINE_COLOR = new BABYLON.Color4(1, 0, 0);

    line: BABYLON.LinesMesh;

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
                let hit = scene.pickWithRay(new BABYLON.Ray(cam.position, cam.getDirection(BABYLON.Vector3.Forward())));
                let target;
                if (hit) {
                    target = hit.pickedPoint;
                }

                if (!target) target = pos;

                this.line = BABYLON.MeshBuilder.CreateLines("pointer", {
                    points: [pos, target],
                    updatable: true,
                    colors: [PointerTool.LINE_COLOR, PointerTool.LINE_COLOR],
                    instance: this.line // Update this line, instead of creating new
                });
            });
    }

    onDeactivate(): void {
        if (this.line) {
            RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene.removeMesh(this.line);
        }
    }

    onRoomChanged(): void {

    }

    canActivate(): boolean {
        return true; // Temp
    }
}