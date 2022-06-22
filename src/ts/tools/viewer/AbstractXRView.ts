import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { BabylonViewer } from "../../gui/BabylonViewer";
import { AbstractTool } from "../AbstractTool";

/**
 * WebXR will not work properly if not accessed via https or localhost. 
 * When used in a local development environment, the best option to access the app via an other device (like a smartphone)
 * is to setup a port forwarding using the chrome devtools at chrome://inspect/#devices (the device must be connect via adb).
 */
export abstract class AbstractXRView extends AbstractTool {
    experience: BABYLON.WebXRDefaultExperience;

    constructor(private babylonViewer: BabylonViewer, name: string, icon: string, public mode: XRSessionMode, public spaceType: XRReferenceSpaceType) {
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
        this.babylonViewer.onXRStateChanged(true);
        this.onXREnter();
    }

    async createXR() {
        const scene: BABYLON.Scene = this.babylonViewer.scene;

        await scene.createDefaultXRExperienceAsync({
        }).then(ex => {
            this.experience = ex;

            this.experience.baseExperience.onStateChangedObservable.add((state) => {
                if (state == BABYLON.WebXRState.NOT_IN_XR) {
                    if (this.active) this.toolbar.deactivateTool(this); // Calls onXRExit later
                    else this.onXRExit(); // Manual call
                }
            });
        });
    }

    override onDeactivate(): void {
        if (this.experience) {
            this.experience.baseExperience.exitXRAsync();
            this.babylonViewer.onXRStateChanged(false);
            this.onXRExit();
        }
        this.experience = null;
    }

    override onRoomChanged(): void {

    }

    abstract onXREnter(): void;
    abstract onXRExit(): void;
}