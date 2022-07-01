import { XRState } from "../../gui/BabylonViewer";
import { RealityBoxCollab } from "../../RealityboxCollab";
import { AbstractXRView } from "./AbstractXRView";

export class VRTool extends AbstractXRView {

    constructor(instance: RealityBoxCollab) {
        super(instance, XRState.VR, "VR View", "fa-solid fa-vr-cardboard", "immersive-vr", "local-floor");
    }

    onXREnter(): void {

    }
    onXRExit(): void {

    }
}