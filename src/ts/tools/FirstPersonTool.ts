import { AbstractTool } from "./AbstractTool";

export class FirstPersonTool extends AbstractTool {

    constructor() {
        super("First Person Tool", "fa-solid fa-eye");
    }

    onActivate(): void {
        
    }
    
    onDeactivate(): void {
        
    }

    onRoomChanged(): void {
        
    }
}