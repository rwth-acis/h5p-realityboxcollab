import { RealityBoxCollab } from "../../RealityboxCollab";
import { AbstractXRView } from "./AbstractXRView";

export class ARTool extends AbstractXRView {
    
    constructor(instance: RealityBoxCollab) {
        super(instance, "AR View", "fa-solid fa-mobile-screen", "immersive-ar", "unbounded");
    }

    onXREnter(): void {
        
    }

    onXRExit(): void {
        
    }

}