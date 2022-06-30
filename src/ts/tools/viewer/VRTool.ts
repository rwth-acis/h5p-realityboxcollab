import { RealityBoxCollab } from "../../RealityboxCollab";
import { AbstractXRView } from "./AbstractXRView";

export class VRTool extends AbstractXRView {

    constructor(instance: RealityBoxCollab) {
        super(instance, "VR View", "fa-solid fa-vr-cardboard", "immersive-vr", "local-floor");
    }

    onXREnter(): void {

    }
    onXRExit(): void {

    }
}