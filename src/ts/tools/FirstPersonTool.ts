import { Vector3 } from "babylonjs";
import { RealityBoxCollab } from "../RealityboxCollab";
import { AbstractTool } from "./AbstractTool";

export class FirstPersonTool extends AbstractTool {

    KEY_W = 87;
    KEY_A = 65;
    KEY_S = 83;
    KEY_D = 68;
    KEY_Q = 81;
    KEY_E = 69;

    camera: BABYLON.FreeCamera;
    moveSpeed: number = 1.2;
    mouseSpeed: number = 2;
    pressedKeys: any = {};
    moveable: boolean;

    constructor() {
        super("First Person Tool", "fa-solid fa-eye");
    }

    onActivate(): void {
        let scene: BABYLON.Scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;

        if (!this.camera) {
            this.createComponents();
        }

        this.camera.position = scene.activeCamera.position;
        scene.activeCamera = this.camera;
    }
    createComponents() {
        let scene: BABYLON.Scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;

        this.camera = new BABYLON.FreeCamera("First Person Camera", new BABYLON.Vector3(), scene, false);

        scene.registerBeforeRender(() => {
            if (!this.active) return;

            let dir = new BABYLON.Vector3(0, 0, 0);

            this.computeDirection(dir, this.KEY_W, this.KEY_S, BABYLON.Vector3.Forward());
            this.computeDirection(dir, this.KEY_D, this.KEY_A, BABYLON.Vector3.Right());
            this.computeDirection(dir, this.KEY_Q, this.KEY_E, BABYLON.Vector3.Up());

            dir.normalize();
            dir.scale(this.moveSpeed);
            this.camera.position.addInPlaceFromFloats(dir.x, dir.y, dir.z);

            return scene;
        });

        window.addEventListener("keydown", e => this.pressedKeys[e.keyCode] = true);
        window.addEventListener("keyup", e => this.pressedKeys[e.keyCode] = false);

        // https://doc.babylonjs.com/divingDeeper/scene/interactWithScenes
        scene.onPointerObservable.add(e => {
            console.log(e);

            if (e.type == BABYLON.PointerEventTypes.POINTERDOWN) {
                this.moveable = true;
            }
            else if (e.type == BABYLON.PointerEventTypes.POINTERUP) {
                this.moveable = false;
            }
        });

        window.onmousemove = e => {
            if (this.moveable) {
                this.camera.rotation.addInPlaceFromFloats(e.movementY * this.mouseSpeed / 100.0, e.movementX * this.mouseSpeed / 100.0, 0);
            }
        };
    }

    computeDirection(dir: BABYLON.Vector3, a: number, b: number, ref: BABYLON.Vector3) {
        if (this.pressedKeys[a] !== this.pressedKeys[b]) { // A xor D
            let v = this.camera.getDirection(ref);
            if (this.pressedKeys[b]) {
                v = v.negate();
            }
            dir.addInPlace(v);
        }
    }

    onDeactivate(): void {
        let scene: BABYLON.Scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;

        scene.activeCamera = scene.cameras[0];
    }

    onRoomChanged(): void {

    }

    canActivate(): boolean {
        return true; // Temp
    }
}