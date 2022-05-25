import { Vector3 } from "babylonjs";
import { RealityBoxCollab } from "../RealityboxCollab";
import { AbstractTool } from "./AbstractTool";

export class FirstPersonTool extends AbstractTool {

    // Key Constants
    KEY_W = 87;
    KEY_A = 65;
    KEY_S = 83;
    KEY_D = 68;
    KEY_Q = 81;
    KEY_E = 69;
    KEY_SHIFT = 16;

    // Camera Settings
    moveSpeed: number = 1.2;
    mouseSpeed: number = 1.2;
    moveShiftFactor: number = 3;

    camera: BABYLON.FreeCamera;
    pressedKeys: boolean[] = [];
    moveable: boolean;
    cursor: boolean;

    constructor() {
        super("First Person Tool", "fa-solid fa-eye");
    }

    onActivate(): void {
        let scene: BABYLON.Scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;

        if (!this.camera) {
            this.createComponents();
        }

        this.camera.position = scene.activeCamera.position;
        this.camera.rotation = scene.activeCamera.absoluteRotation.toEulerAngles();
        this.camera.rotation.z = 0;
        scene.activeCamera = this.camera;
    }
    createComponents() {
        let scene: BABYLON.Scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;

        this.camera = new BABYLON.FreeCamera("First Person Camera", new BABYLON.Vector3(), scene, false);

        scene.registerBeforeRender(() => {
            if (!this.active || !this.moveable) {
                if (this.cursor) {
                    RealityBoxCollab.instance.realitybox.viewer._$canvas.removeClass("nocursor");
                    this.cursor = false;
                }
                return;
            }

            this.cursor = true;
            RealityBoxCollab.instance.realitybox.viewer._$canvas.addClass("nocursor");

            let dir = new BABYLON.Vector3(0, 0, 0);

            this.computeDirection(dir, this.KEY_W, this.KEY_S, BABYLON.Vector3.Forward());
            this.computeDirection(dir, this.KEY_D, this.KEY_A, BABYLON.Vector3.Right());
            this.computeDirection(dir, this.KEY_E, this.KEY_Q, BABYLON.Vector3.Up());

            dir = dir.normalize().scale(this.moveSpeed * (this.getKey(this.KEY_SHIFT) ? this.moveShiftFactor : 1));
            this.camera.position.addInPlaceFromFloats(dir.x, dir.y, dir.z);

            return scene;
        });

        scene.onKeyboardObservable.add((e) => {
            if (e.type == BABYLON.KeyboardEventTypes.KEYDOWN) {
                this.pressedKeys[e.event.keyCode] = true;
            }
            else if (e.type == BABYLON.KeyboardEventTypes.KEYUP) {
                this.pressedKeys[e.event.keyCode] = false;
            }
        });

        // https://doc.babylonjs.com/divingDeeper/scene/interactWithScenes
        scene.onPointerObservable.add(e => {
            if (!this.active) return;

            if (e.type == BABYLON.PointerEventTypes.POINTERDOWN && e.event.button == 2) {
                this.moveable = true;
            }
            else if (e.type == BABYLON.PointerEventTypes.POINTERUP && e.event.button == 2) {
                this.moveable = false;
            }
            else if (e.type == BABYLON.PointerEventTypes.POINTERMOVE && this.moveable) {
                let x = e.event.movementY * this.mouseSpeed / 200.0;
                let y = e.event.movementX * this.mouseSpeed / 200.0;

                this.camera.rotation.addInPlaceFromFloats(x, y, 0);
            }
        });
    }

    getKey(code: number): boolean {
        if (this.pressedKeys[code] == undefined) this.pressedKeys[code] = false;
        return this.pressedKeys[code];
    }

    computeDirection(dir: BABYLON.Vector3, a: number, b: number, ref: BABYLON.Vector3) {
        if (this.getKey(a) !== this.getKey(b)) { // A xor D
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