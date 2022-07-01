import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { XRState } from "../../gui/BabylonViewer";
import { RealityBoxCollab } from "../../RealityboxCollab";
import { AbstractTool } from "../AbstractTool";

/**
 * WebXR will not work properly if not accessed via https or localhost. 
 * When used in a local development environment, the best option to access the app via an other device (like a smartphone)
 * is to setup a port forwarding using the chrome devtools at chrome://inspect/#devices (the device must be connect via adb).
 */
export abstract class AbstractXRView extends AbstractTool {
    experience: BABYLON.WebXRDefaultExperience;

    constructor(private instance: RealityBoxCollab, private state: XRState, name: string, icon: string, public mode: XRSessionMode, public spaceType: XRReferenceSpaceType) {
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
        this.instance.babylonViewer.onXRStateChanged(this.state);
        this.pOnXREnter();
    }

    async createXR() {
        const scene: BABYLON.Scene = this.instance.babylonViewer.scene;

        await scene.createDefaultXRExperienceAsync({
        }).then(ex => {
            this.experience = ex;

            this.experience.baseExperience.onStateChangedObservable.add((state) => {
                if (state == BABYLON.WebXRState.NOT_IN_XR) {
                    if (this.active) this.toolbar.deactivateActiveTool(); // Calls onXRExit later
                    else this.pOnXRExit(); // Manual call
                }
            });
        });
    }

    override onDeactivate(): void {
        if (this.experience) {
            this.experience.baseExperience.exitXRAsync();
            this.instance.babylonViewer.onXRStateChanged(XRState.NONE);
            this.onXRExit();
        }
        this.experience = null;
    }

    override onRoomChanged(): void {

    }

    private pOnXREnter() {
        this.instance.babylonViewer.babylonBox.hideAllAnnotations();
        this.onXREnter();
    }

    private pOnXRExit() {
        this.instance.babylonViewer.babylonBox.showAllAnnotations();
        this.onXRExit();
    }

    abstract onXREnter(): void;
    abstract onXRExit(): void;
}