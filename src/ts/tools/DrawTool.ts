import { AbstractTool } from "./AbstractTool";

export class DrawTool extends AbstractTool {

    constructor() {
        super("Draw Tool", "fa-solid fa-pen", s => s.canUsePenTool);
    }

    override onActivate(): void {
        
    }
    
    override onDeactivate(): void {
        
    }

    override onRoomChanged(): void {
        
    }
}