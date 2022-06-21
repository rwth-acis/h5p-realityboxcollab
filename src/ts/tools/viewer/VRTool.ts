import { BabylonViewer } from "../../gui/BabylonViewer";
import { AbstractXRView } from "./AbstractXRView";

export class VRTool extends AbstractXRView {

    constructor(babylonViewer: BabylonViewer) {
        super(babylonViewer, "VR View", "fa-solid fa-vr-cardboard", "immersive-vr", "local-floor");
    }

    onXREnter(): void {

    }
    onXRExit(): void {

    }
}