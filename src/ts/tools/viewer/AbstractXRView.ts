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

    constructor(name: string, icon: string, public mode: XRSessionMode, public spaceType: XRReferenceSpaceType,
        public worldScale: number = 1, public baseScale: number = 1) {
        super(name, icon);
    }

    // https://doc.babylonjs.com/divingDeeper/webXR/introToWebXR
    // https://codingxr.com/articles/webxr-with-babylonjs/
    // https://doc.babylonjs.com/divingDeeper/webXR/webXRDemos
    override async onActivate() {
        if (!this.experience) {
            await this.createXR();
        }

        this.experience.baseExperience.enterXRAsync(this.mode, this.spaceType);
        RealityBoxCollab.instance.babylonViewer.onXRStateChanged(true);
        RealityBoxCollab.instance.babylonViewer.scaleWorld(this.worldScale, this.baseScale);
        this.onXREnter();
    }

    async createXR() {
        const scene: BABYLON.Scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;

        await scene.createDefaultXRExperienceAsync({
        }).then(ex => {
            this.experience = ex;

            this.experience.baseExperience.onStateChangedObservable.add((state) => {
                if (state == BABYLON.WebXRState.NOT_IN_XR) {
                    this.toolbar.deactivateTool(this);
                }
            });
        });
    }

    override onDeactivate(): void {
        if (this.experience) {
            this.experience.baseExperience.exitXRAsync();
            RealityBoxCollab.instance.babylonViewer.onXRStateChanged(false);
            RealityBoxCollab.instance.babylonViewer.scaleWorld(1 / this.worldScale, this.baseScale);
            this.onXRExit();
        }
        this.experience = null;
    }

    override onRoomChanged(): void {

    }

    abstract onXREnter(): void;
    abstract onXRExit(): void;
}