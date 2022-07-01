import { XRState } from "../../gui/BabylonViewer";
import { RealityBoxCollab } from "../../RealityboxCollab";
import { AbstractXRView } from "./AbstractXRView";

export class ARTool extends AbstractXRView {
    
    constructor(instance: RealityBoxCollab) {
        super(instance, XRState.AR, "AR View", "fa-solid fa-mobile-screen", "immersive-ar", "unbounded");
    }

    onXREnter(): void {
        
    }

    onXRExit(): void {
        
    }

}