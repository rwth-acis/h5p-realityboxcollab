import { RealityBoxCollab } from "../../RealityboxCollab";
import { AbstractTool } from "../AbstractTool";
import * as BABYLON from "@babylonjs/core/Legacy/legacy";

/**
 * WebXR will not work properly if not accessed via https or localhost. 
 * When used in a local development environment, the best option to access the app via an other device (like a smartphone)
 * is to setup a port forwarding using the chrome devtools at chrome://inspect/#devices (the device must be connect via adb).
 */
export abstract class AbstractXRView extends AbstractTool {
    experience: BABYLON.WebXRDefaultExperience;
    oldScale: BABYLON.Vector3;

    constructor(name: string, icon: string, public mode: XRSessionMode, public spaceType: XRReferenceSpaceType) {
        super(name, icon);
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
            ex.baseExperience.enterXRAsync(this.mode, this.spaceType);

            this.onXREnter();
            RealityBoxCollab.instance.babylonViewer.onXRStateChanged(true);

            this.experience.baseExperience.onStateChangedObservable.add((state) => {
                if (state == BABYLON.WebXRState.EXITING_XR) this.toolbar.deactivateTool(this);
            });
        });
    }

    override onDeactivate(): void {
        if (this.experience) {
            this.experience.baseExperience.exitXRAsync();
            RealityBoxCollab.instance.babylonViewer.onXRStateChanged(false);
            this.onXRExit();
        }
        this.experience = null;
    }

    override onRoomChanged(): void {

    }

    abstract onXREnter(): void;
    abstract onXRExit(): void;
}