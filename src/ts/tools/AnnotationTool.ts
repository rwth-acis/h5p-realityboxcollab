import { RealityBoxCollab } from "../RealityboxCollab";
import { RealityboxAnnotation } from "../RealityboxTypes";
import { AbstractTool } from "./AbstractTool";

export class AnnotationTool extends AbstractTool {

    callbackRegistered: boolean = false;

    constructor(private instance: RealityBoxCollab) {
        super("Annotation Tool", "fa-solid fa-note-sticky", s => s.canUseAnnotationTool);
    }

    override onActivate(): void {
        const babylonBox = this.instance.babylonViewer.babylonBox;

        // Prevent default behavior (RealityBoxs WebXR is not used anyway)
        babylonBox.webXR.inWebXR = true;
        if (!this.callbackRegistered) {
            babylonBox.on('annotation picked', (a: any) => { if (this.active) this.onAnnotationPicked(a.data) });
            this.callbackRegistered = true;
        }
    }

    override onDeactivate(): void {
        (this.instance.babylonViewer.babylonBox as any).webXR.inWebXR = false;
    }

    override onRoomChanged(): void {

    }

    private onAnnotationPicked(a: RealityboxAnnotation) {
        console.log(a.position);
    }

}