import { RealityBoxCollab } from "../../RealityboxCollab";
import { AbstractTool } from "../AbstractTool";
import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { BabylonViewer } from "../../gui/BabylonViewer";

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
    moveSpeed: number = 1.2 * BabylonViewer.WORLD_SIZE;
    mouseSpeed: number = 1.2 * BabylonViewer.WORLD_SIZE;
    moveShiftFactor: number = 3;

    camera: BABYLON.FreeCamera;
    pressedKeys: boolean[] = [];
    moveable: boolean;
    cursor: boolean;

    constructor() {
        super("First Person Tool", "fa-solid fa-eye");
    }

    override onActivate(): void {
        const scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;
        const oldCamera = scene.cameras[0];

        if (!this.camera) {
            this.createComponents();
        }

        // 3 m from world origin
        this.camera.position = oldCamera.getDirection(BABYLON.Vector3.Forward()).scale(-3);
        this.camera.rotation = oldCamera.absoluteRotation.toEulerAngles();
        this.camera.rotation.z = 0;
        // Avoid camera input when inactive (even setEnabled does not disable input)
        (oldCamera.inputs.attached.pointers as any).buttons = [];
        scene.activeCamera = this.camera;
    }

    createComponents(): void {
        let scene: BABYLON.Scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;

        this.camera = new BABYLON.FreeCamera("First Person Camera", new BABYLON.Vector3(), scene, false);
        this.camera.minZ = 0;

        scene.registerBeforeRender(() => {
            if (!this.active || !this.moveable) {
                if (this.cursor) {
                    RealityBoxCollab.instance.realitybox.viewer._$canvas.removeClass("nocursor");
                    this.cursor = false;
                }
                return scene;
            }

            this.cursor = true;
            RealityBoxCollab.instance.realitybox.viewer._$canvas.addClass("nocursor");

            let dir = new BABYLON.Vector3(0, 0, 0);

            this.computeDirection(dir, this.KEY_W, this.KEY_S, BABYLON.Vector3.Forward());
            this.computeDirection(dir, this.KEY_D, this.KEY_A, BABYLON.Vector3.Right());
            this.computeDirection(dir, this.KEY_E, this.KEY_Q, BABYLON.Vector3.Up());

            dir = dir.normalize().scale(this.moveSpeed * (this.getKey(this.KEY_SHIFT) ? this.moveShiftFactor : 1)  / 50);
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

    computeDirection(dir: BABYLON.Vector3, a: number, b: number, ref: BABYLON.Vector3): void {
        if (this.getKey(a) !== this.getKey(b)) { // A xor D
            let v = this.camera.getDirection(ref);
            if (this.pressedKeys[b]) {
                v = v.negate();
            }
            dir.addInPlace(v);
        }
    }

    override onDeactivate(): void {
        const scene: BABYLON.Scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;
        scene.activeCamera = scene.cameras[0];
        // Reactivate camera
        (scene.cameras[0].inputs.attached.pointers as any).buttons = [0, 1, 2];
    }

    override onRoomChanged(): void {

    }
}