import { AbstractTool } from "../AbstractTool";
import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { BabylonViewer } from "../../gui/BabylonViewer";
import { RealityBoxCollab } from "../../RealityboxCollab";
import { InputManager } from "../../utils/InputManager";

export class FirstPersonTool extends AbstractTool {

    // Camera Settings
    moveSpeed: number = 1.2 * BabylonViewer.WORLD_SIZE;
    mouseSpeed: number = 1.2 * BabylonViewer.WORLD_SIZE;
    moveShiftFactor: number = 3;

    camera: BABYLON.FreeCamera;
    moveable: boolean;
    cursor: boolean;

    constructor(private instance: RealityBoxCollab) {
        super("First Person Tool", "fa-solid fa-eye");
    }

    override onActivate(): void {
        const scene = this.instance.realitybox.viewer._babylonBox.scene;
        const oldCamera = scene.cameras[0];

        if (!this.camera) this.createComponents();

        // 3 m from world origin
        this.camera.position = oldCamera.getDirection(BABYLON.Vector3.Forward()).scale(-3);
        this.camera.rotation = oldCamera.absoluteRotation.toEulerAngles();
        this.camera.rotation.z = 0;
        scene.activeCamera = this.camera;
    }

    createComponents(): void {
        let scene: BABYLON.Scene = this.instance.realitybox.viewer._babylonBox.scene;

        this.camera = new BABYLON.FreeCamera("First Person Camera", new BABYLON.Vector3(), scene, false);
        this.camera.minZ = 0;

        scene.registerBeforeRender(() => {
            if (!this.active || !this.moveable) {
                if (this.cursor) {
                    this.instance.realitybox.viewer._$canvas.removeClass("nocursor");
                    this.cursor = false;
                }
                return scene;
            }

            this.cursor = true;
            this.instance.realitybox.viewer._$canvas.addClass("nocursor");

            let dir = new BABYLON.Vector3(0, 0, 0);

            this.computeDirection(dir, InputManager.KEY_W, InputManager.KEY_S, BABYLON.Vector3.Forward());
            this.computeDirection(dir, InputManager.KEY_D, InputManager.KEY_A, BABYLON.Vector3.Right());
            this.computeDirection(dir, InputManager.KEY_E, InputManager.KEY_Q, BABYLON.Vector3.Up());

            dir = dir.normalize().scale(this.moveSpeed * (this.instance.inputManager.isKeyDown(InputManager.KEY_SHIFT) ? this.moveShiftFactor : 1)  / 50);
            this.camera.position.addInPlaceFromFloats(dir.x, dir.y, dir.z);

            return scene;
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

    computeDirection(dir: BABYLON.Vector3, a: number, b: number, ref: BABYLON.Vector3): void {
        if (this.instance.inputManager.isKeyDown(a) !== this.instance.inputManager.isKeyDown(b)) { // A xor D
            let v = this.camera.getDirection(ref);
            if (this.instance.inputManager.isKeyDown(b)) {
                v = v.negate();
            }
            dir.addInPlace(v);
        }
    }

    override onDeactivate(): void {
        const scene: BABYLON.Scene = this.instance.realitybox.viewer._babylonBox.scene;
        scene.activeCamera = scene.cameras[0]; // Reactivate camera
    }

    override onRoomChanged(): void {

    }
}