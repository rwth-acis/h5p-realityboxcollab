import { AbstractXRView } from "./AbstractXRView";

export class ARTool extends AbstractXRView {
    
    constructor() {
        super("AR View", "fa-solid fa-mobile-screen", "immersive-ar", "unbounded");
    }

    onXREnter(): void {
        
    }
    onXRExit(): void {
        
    }

}