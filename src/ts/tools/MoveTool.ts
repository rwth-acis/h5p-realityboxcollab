import { AbstractTool } from "./AbstractTool";

export class MoveTool extends AbstractTool {

    constructor() {
        super("Move Tool", "fa-solid fa-arrows-up-down-left-right");
    }

    onActivate(): void {
        
    }
    
    onDeactivate(): void {
        
    }

    onRoomChanged(): void {
        
    }
}