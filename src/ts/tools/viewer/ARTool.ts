import { XRState } from "../../gui/BabylonViewer";
import { RealityBoxCollab } from "../../RealityboxCollab";
import { AbstractXRView } from "./AbstractXRView";

export class ARTool extends AbstractXRView {
    
    /**
     * Create a AR view
     * @param instance The RealityboxCollab instance
     */
    constructor(instance: RealityBoxCollab) {
        super(instance, XRState.AR, "AR View", "fa-solid fa-mobile-screen", "immersive-ar", "unbounded");
    }

    onXREnter() {}

    onXRExit() {}

}