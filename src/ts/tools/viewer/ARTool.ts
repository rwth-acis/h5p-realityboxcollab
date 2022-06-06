import { RealityBoxCollab } from "../../RealityboxCollab";
import { AbstractTool } from "../AbstractTool";

/**
 * WebXR will not work properly if not accessed via https or localhost. 
 * When used in a local development environment, the best option to access the app via an other device (like a smartphone)
 * is to setup a port forwarding using the chrome devtools at chrome://inspect/#devices (the device must be connect via adb).
 */
export class ARTool extends AbstractTool {

    constructor() {
        super("AR View", "fa-solid fa-mobile-screen");
    }

    // https://doc.babylonjs.com/divingDeeper/webXR/introToWebXR
    override onActivate(): void {
        const scene: BABYLON.Scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;

        scene.createDefaultXRExperienceAsync({
            uiOptions: {
                sessionMode: "immersive-ar" // immersive-vr
            }
        });
    }

    override onDeactivate(): void {

    }

    override onRoomChanged(): void {

    }
}