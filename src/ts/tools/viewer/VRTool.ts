import { AbstractXRView } from "./AbstractXRView";

export class VRTool extends AbstractXRView {

    constructor() {
        super("VR View", "fa-solid fa-vr-cardboard", "immersive-vr", "local-floor");
    }

    onXREnter(): void {

    }
    onXRExit(): void {

    }
}