import { RealityBoxCollab } from "../../RealityboxCollab";
import { AbstractTool } from "../AbstractTool";
import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { BabylonViewer } from "../../gui/BabylonViewer";

export class OrbitTool extends AbstractTool {

    constructor() {
        super("Orbit Tool", "fa-solid fa-circle-notch");
    }

    override onActivate(): void {
        const cam = RealityBoxCollab.instance.babylonViewer.scene.activeCamera as BABYLON.ArcRotateCamera;
    }

    override onDeactivate(): void {

    }

    override onRoomChanged(): void {

    }

}