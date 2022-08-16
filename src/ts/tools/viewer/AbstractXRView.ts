import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { XRState } from "../../gui/BabylonViewer";
import { Popups } from "../../gui/popup/Popups";
import { RealityBoxCollab } from "../../RealityboxCollab";
import { AbstractTool } from "../AbstractTool";

/**
 * Abstraction layer for XR Tools (namely the ARTool and the VRTool).
 * 
 * Note for WebXR:
 * --------------
 * WebXR will not work properly if not accessed via https or localhost. 
 * When used in a local development environment, the best option to access the app via an other device (like a smartphone)
 * is to setup a port forwarding using the chrome devtools at chrome://inspect/#devices (the device must be connect via adb).
 */
export abstract class AbstractXRView extends AbstractTool {
    experience: BABYLON.WebXRDefaultExperience;

    /**
     * Create a XR view
     * @param instance The RealityboxCollab instance
     * @param state The state, this XR view enters
     * @param name The name of the tool
     * @param icon The icon of the tool
     * @param mode The session mode to use for this XR view
     * @param spaceType The space type to use fo this XR view
     */
    constructor(private instance: RealityBoxCollab, private state: XRState, name: string, icon: string, public mode: XRSessionMode, public spaceType: XRReferenceSpaceType) {
        super(name, icon);
    }

    /**
     * Calls {@link AbstractXRView.createXR}, if not called before and then enters the XR session
     */
    override async onActivate() {
        if (!this.experience) await this.createXR();

        let supported = await this.experience.baseExperience.sessionManager.isSessionSupportedAsync(this.mode);
        console.log(supported);
        if (!supported) {
            Popups.alert("This type of XR mode is not supported in your browser or you do not have a proper device connected");
            if (this.active) this.toolbar.deactivateActiveTool();
            return;
        }
        await this.experience.baseExperience.enterXRAsync(this.mode, this.spaceType);
        this.instance.babylonViewer.onXRStateChanged(this.state, this.experience);
        this.pOnXREnter();
    }

    /**
     * Called when the tool enters its XR session first
     */
    async createXR() {
        const scene: BABYLON.Scene = this.instance.babylonViewer.scene;

        await scene.createDefaultXRExperienceAsync({
        })
            .then(ex => {
                this.experience = ex;

                this.experience.baseExperience.onStateChangedObservable.add((state) => {
                    if (state == BABYLON.WebXRState.NOT_IN_XR) {
                        if (this.active) this.toolbar.deactivateActiveTool(); // Calls onXRExit later
                        else this.pOnXRExit(); // Manual call
                    }
                });
            });
    }

    /**
     * If in an XR session, exit it
     */
    override onDeactivate() {
        if (this.experience) {
            this.experience.baseExperience.exitXRAsync();
            this.instance.babylonViewer.onXRStateChanged(XRState.NONE, this.experience);
            this.onXRExit();
        }
        this.experience = null;
    }

    override onRoomChanged() { }

    /**
     * Hides all annotations of Realitybox and calls {@link AbstractXRView.onXREnter}
     */
    private pOnXREnter() {
        this.instance.babylonViewer.babylonBox.hideAllAnnotations();
        this.onXREnter();
    }

    /**
     * Shows all annotations of Realitybox and calls {@link AbstractXRView.onXRExit}
     */
    private pOnXRExit() {
        this.instance.babylonViewer.babylonBox.showAllAnnotations();
        this.onXRExit();
    }

    /**
     * Called when entering the XR session
     */
    abstract onXREnter(): void;

    /**
     * Called when exiting the XR session (also if terminated by the browser / devise by for example taking of a HMD)
     */
    abstract onXRExit(): void;
}