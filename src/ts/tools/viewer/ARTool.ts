import { AbstractXRView } from "./AbstractXRView";

export class ARTool extends AbstractXRView {
    
    constructor() {
        super("AR View", "fa-solid fa-mobile-screen", "immersive-ar", "unbounded", 0.05, 0.5);
    }

    onXREnter(): void {
        
    }

    onXRExit(): void {
        
    }

}