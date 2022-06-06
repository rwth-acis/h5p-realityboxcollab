import { RealityBoxCollab } from "../../RealityboxCollab";
import { AbstractTool } from "../AbstractTool";

/**
 * See documentation for ARTool for a workaround when using WebXR over a non-https connection.
 */
export class VRTool extends AbstractTool {

    constructor() {
        super("VR View", "fa-solid fa-vr-cardboard");
    }

    override onActivate(): void {
        const scene: BABYLON.Scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;

        scene.createDefaultXRExperienceAsync({
            uiOptions: {
                sessionMode: "immersive-vr"
            }
        });
    }

    override onDeactivate(): void {

    }

    override onRoomChanged(): void {

    }
}