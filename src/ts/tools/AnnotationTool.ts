import { AbstractTool } from "./AbstractTool";

export class AnnotationTool extends AbstractTool {

    constructor() {
        super("Annotation Tool", "fa-solid fa-note-sticky", s => s.canUseAnnotationTool);
    }

    override onActivate(): void {
        
    }
    
    override onDeactivate(): void {
        
    }

    override onRoomChanged(): void {
        
    }

}