import { AbstractXRView } from "./AbstractXRView";

export class VRTool extends AbstractXRView {

    constructor() {
        super("VR View", "fa-solid fa-vr-cardboard", "immersive-vr", undefined);
    }

    onXREnter(): void {

    }
    onXRExit(): void {

    }
}