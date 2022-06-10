import { RealityBoxCollab } from "../RealityboxCollab";
import { AbstractTool } from "./AbstractTool";
import * as BABYLON from "@babylonjs/core/Legacy/legacy";


export class DrawTool extends AbstractTool {
    line: BABYLON.Mesh;

    constructor() {
        super("Draw Tool", "fa-solid fa-pen", s => s.canUsePenTool);
    }

    override onActivate(): void {
        RealityBoxCollab.instance.babylonViewer.scene.onBeforeRenderObservable.add((scene: BABYLON.Scene) => {
            if (this.line) return;
            
            this.line = BABYLON.MeshBuilder.CreateTube("tube", {
                path: [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 50, 0)],
                radius: 3,
                updatable: true,
                instance: this.line
            }, scene);
            this.line.setParent(RealityBoxCollab.instance.babylonViewer.baseNode);
            let mat = new BABYLON.StandardMaterial("matPointerBall", RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene);
            mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
            this.line.material = mat;

            let layer = new BABYLON.UtilityLayerRenderer(scene);
            console.log(layer.originalScene.getEngine());
            let gizmoManager = new BABYLON.GizmoManager(scene, 1, layer, layer);
            gizmoManager.boundingBoxGizmoEnabled = true;
            gizmoManager.usePointerToAttachGizmos = false; // Might be changed for multiple models
        });
    }

    override onDeactivate(): void {

    }

    override onRoomChanged(): void {

    }
}