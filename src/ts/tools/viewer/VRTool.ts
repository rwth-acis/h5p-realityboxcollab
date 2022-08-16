import { XRState } from "../../gui/BabylonViewer";
import { RealityBoxCollab } from "../../RealityboxCollab";
import { AbstractXRView } from "./AbstractXRView";

export class VRTool extends AbstractXRView {

    /**
    * Create a VR view
    * @param instance The RealityboxCollab instance
    */
    constructor(instance: RealityBoxCollab) {
        super(instance, XRState.VR, "VR View", "fa-solid fa-vr-cardboard", "immersive-vr", "local-floor");
    }

    onXREnter() {}
    
    onXRExit() { }
}