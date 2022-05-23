import { AbstractTool } from "./AbstractTool";

export class OrbitTool extends AbstractTool {

    constructor() {
        super("Orbit Tool", "fa-solid fa-circle-notch");
    }

    onActivate(): void {
        console.log("Orbit Tool activated");
    }
    
    onDeactivate(): void {
        console.log("Orbit Tool deactivated");
    }

    onRoomChanged(): void {
        
    }
}