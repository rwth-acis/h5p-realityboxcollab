import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { Ray } from "@babylonjs/core/Legacy/legacy";
import { Scene } from "@babylonjs/core/scene";
import { BabylonViewer } from "../gui/BabylonViewer";

export class InputManager {

    // Key Constants
    static KEY_W = 87;
    static KEY_A = 65;
    static KEY_S = 83;
    static KEY_D = 68;
    static KEY_Q = 81;
    static KEY_E = 69;
    static KEY_SHIFT = 16;

    private pressedKeys: boolean[] = [];

    constructor(private babylonViewer: BabylonViewer) {
        babylonViewer.scene.onKeyboardObservable.add((e) => {
            if (e.type == BABYLON.KeyboardEventTypes.KEYDOWN) {
                this.pressedKeys[e.event.keyCode] = true;
            }
            else if (e.type == BABYLON.KeyboardEventTypes.KEYUP) {
                this.pressedKeys[e.event.keyCode] = false;
            }
        });
    }

    isKeyDown(code: number): boolean {
        return this.pressedKeys[code] != undefined ? this.pressedKeys[code] : false;
    }

    pickWithPointer(): BABYLON.PickingInfo {
        const scene = this.babylonViewer.scene;
        const model = this.babylonViewer.models[0]; // Remove?

        if (this.babylonViewer.isInXR) {
            let ray = {} as BABYLON.Ray;
            this.babylonViewer.xrGui[0].experience.pointerSelection
                .getXRControllerByPointerId(0)
                .getWorldPointerRayToRef(ray);
            return scene.pickWithRay(ray);
        }
        else {
            return scene.pick(scene.pointerX, scene.pointerY, mesh => model.getChildMeshes().find(c => c == mesh) != undefined);
        }
    }
}