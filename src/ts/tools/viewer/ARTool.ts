import { BabylonViewer } from "../../gui/BabylonViewer";
import { AbstractXRView } from "./AbstractXRView";

export class ARTool extends AbstractXRView {
    
    constructor(babylonViewer: BabylonViewer) {
        super(babylonViewer, "AR View", "fa-solid fa-mobile-screen", "immersive-ar", "unbounded");
    }

    onXREnter(): void {
        
    }

    onXRExit(): void {
        
    }

}