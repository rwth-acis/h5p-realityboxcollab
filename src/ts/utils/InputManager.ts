import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { BabylonViewer, XRState } from "../gui/BabylonViewer";

/**
 * The InputManager abstracts away a few input related functionalities used by multiple classes. 
 */
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

    /**
     * Create an InputManager instance
     * @param babylonViewer The babylonviewer instance of this RealityboxCollab instance
     */
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

    /**
     * Check whether a key is currently down
     * @param code The code of the key. See constants of {@link InputManager}
     * @returns true, if the key is currently down
     */
    isKeyDown(code: number): boolean {
        return this.pressedKeys[code] != undefined ? this.pressedKeys[code] : false;
    }

    /**
     * Sends a raycast depending on the XR state of the application to choose a point on a part of a mesh of one of the models in the scene.
     * If in VR, this will be done over the controllers ray. If not, the mouse / touch pointer will be used instead
     * @returns The picking info created by the scenes ray cast
     */
    pickWithPointer(): BABYLON.PickingInfo {
        const scene = this.babylonViewer.scene;

        if (this.babylonViewer.xrState == XRState.VR) {
            let ray = new BABYLON.Ray(new BABYLON.Vector3(), new BABYLON.Vector3()); // Dummy, will be overridden
            let c = this.babylonViewer.xrGui[0].getActiveController();
            c.getWorldPointerRayToRef(ray);
            ray.origin = c.pointer.position;
            return scene.pickWithRay(ray, mesh => this.checkMesh(mesh));
        }
        else {
            return scene.pick(scene.pointerX, scene.pointerY, mesh => this.checkMesh(mesh));
        }
    }

    /**
     * Predicate for scenes raycast to ignore meshes which are not part of any model in the scene
     * @param mesh The mesh to check
     * @returns true, if the mesh is part of any model in the scene and therefore can be picked
     */
    private checkMesh(mesh: BABYLON.AbstractMesh): boolean {
        const models = this.babylonViewer.models;

        for (let m of models) {
            if (m.getChildMeshes().find(c => c == mesh) != undefined) {
                return true;
            }
        }
        return false;
    }
}