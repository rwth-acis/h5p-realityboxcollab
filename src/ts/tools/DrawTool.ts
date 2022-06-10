import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { RealityBoxCollab } from "../RealityboxCollab";
import { Utils } from "../utils/Utils";
import { AbstractTool } from "./AbstractTool";


export class DrawTool extends AbstractTool {
    line: BABYLON.Mesh;
    positions: BABYLON.Vector3[] = [];
    lastPosition: BABYLON.Vector3;
    frame: number = 0;
    mat: BABYLON.StandardMaterial;

    constructor() {
        super("Draw Tool", "fa-solid fa-pen", s => s.canUsePenTool);

        this.mat = new BABYLON.StandardMaterial("matDrawPen", RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene);
        this.mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
    }

    override onActivate(): void {
        RealityBoxCollab.instance.babylonViewer.scene.onBeforeRenderObservable.add((scene: BABYLON.Scene) => {
            this.frame++;
            if (this.frame % 20 != 0) return;

            const cam = scene.activeCamera;
            let pos = cam.position.add(cam.getDirection(BABYLON.Vector3.Forward()).normalizeToNew().scale(60));
            if (this.lastPosition && Utils.vectorEquals(this.lastPosition, pos)) return;
            this.lastPosition = pos;

            this.positions.push(pos);
            console.log(this.positions);
            if (this.positions.length > 3) this.updateLine(scene);
        });
    }

    updateLine(scene: BABYLON.Scene): void {
        if (this.line) scene.removeMesh(this.line);

        // Updatable not possible, because position size changes
        this.line = BABYLON.MeshBuilder.CreateTube("tube", {
            path: this.positions,
            radius: 3,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, scene);
        this.line.setParent(RealityBoxCollab.instance.babylonViewer.baseNode);

        this.line.material = this.mat;
    }

    override onDeactivate(): void {

    }

    override onRoomChanged(): void {

    }
}