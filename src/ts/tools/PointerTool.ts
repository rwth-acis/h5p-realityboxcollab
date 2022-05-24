import { AbstractTool } from "./AbstractTool";

export class PointerTool extends AbstractTool {

    constructor() {
        super("Pointer Tool", "fa-solid fa-person-chalkboard");
    }

    onActivate(): void {
        
    }
    
    onDeactivate(): void {
        
    }

    onRoomChanged(): void {
        
    }

    canActivate(): boolean {
        return true; // Temp
    }
}