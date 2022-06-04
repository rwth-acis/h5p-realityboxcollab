import { AbstractTool } from "./AbstractTool";

export class OrbitTool extends AbstractTool {

    constructor() {
        super("Orbit Tool", "fa-solid fa-circle-notch");
    }

    onActivate(): void {
        
    }
    
    onDeactivate(): void {
        
    }

    onRoomChanged(): void {
        
    }

    canActivate(): boolean {
        return true;
    }
}