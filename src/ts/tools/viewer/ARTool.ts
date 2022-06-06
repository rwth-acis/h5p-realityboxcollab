import { ModelShape } from "babylonjs";
import { RealityBoxCollab } from "../../RealityboxCollab";
import { AbstractTool } from "../AbstractTool";

/**
 * WebXR will not work properly if not accessed via https or localhost. 
 * When used in a local development environment, the best option to access the app via an other device (like a smartphone)
 * is to setup a port forwarding using the chrome devtools at chrome://inspect/#devices (the device must be connect via adb).
 */
export class ARTool extends AbstractTool {
    oldScale: BABYLON.Vector3;
    experience: BABYLON.WebXRDefaultExperience;

    constructor() {
        super("AR View", "fa-solid fa-mobile-screen");
    }

    // https://doc.babylonjs.com/divingDeeper/webXR/introToWebXR
    // https://codingxr.com/articles/webxr-with-babylonjs/
    // https://doc.babylonjs.com/divingDeeper/webXR/webXRDemos
    override onActivate(): void {
        const scene: BABYLON.Scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;

        scene.createDefaultXRExperienceAsync({
        }).then(ex => {
            this.experience = ex;
            this.oldScale = RealityBoxCollab.instance.realitybox.viewer._babylonBox.model.env.scaling;
            RealityBoxCollab.instance.realitybox.viewer._babylonBox.model.env.scaling.scaleInPlace(0.01);
            ex.baseExperience.enterXRAsync("immersive-ar", "unbounded");
        });
    }

    override onDeactivate(): void {
        if (this.experience) {
            this.experience.baseExperience.exitXRAsync();
        }
        RealityBoxCollab.instance.realitybox.viewer._babylonBox.model.env.scaling = this.oldScale;
    }

    override onRoomChanged(): void {

    }
}