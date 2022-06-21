import { BabylonViewer } from "../../gui/BabylonViewer";
import { AbstractXRView } from "./AbstractXRView";

export class ARTool extends AbstractXRView {
    
    constructor(babylonViewer: BabylonViewer) {
        super(babylonViewer, "AR View", "fa-solid fa-mobile-screen", "immersive-ar", "unbounded", 0.05, 0.5);
    }

    onXREnter(): void {
        
    }

    onXRExit(): void {
        
    }

}