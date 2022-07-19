import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { BabylonViewer } from "../../gui/BabylonViewer";
import { AbstractTool } from "../AbstractTool";

/**
 * The normal view mode is just the default lit version of the scene. It is its own class to be easily accessible as a tool and has no functionality itself.
 */
export class NormalViewMode extends AbstractTool {

    constructor(private babylonViewer: BabylonViewer) {
        super("Normal", "fa-solid fa-earth-americas");
    }

    onActivate(): void { }
    onDeactivate(): void { }
    onRoomChanged(): void { }

}

export class PaintViewMode extends AbstractTool {

    texture: BABYLON.DynamicTexture;
    material: BABYLON.StandardMaterial;
    oldMaterials: Map<BABYLON.AbstractMesh, BABYLON.Material> = new Map();

    constructor(private babylonViewer: BabylonViewer) {
        super("Paint", "fa-solid fa-paintbrush");
        this.initPaint();
    }

    onActivate(): void {
        forMeshes(this.babylonViewer, mesh => {
            this.oldMaterials.set(mesh, mesh.material);
            mesh.material = this.material;
        });
    }

    onDeactivate(): void {
        forMeshes(this.babylonViewer, mesh => mesh.material = this.oldMaterials.get(mesh));
    }

    onRoomChanged(): void {
        this.initPaint();
    }

    private initPaint() {
        const scene = this.babylonViewer.scene;

        this.texture = new BABYLON.DynamicTexture("dynTex1", {
            width: 512,
            height: 512
        }, scene, true);
        this.material = new BABYLON.StandardMaterial("texMat", scene);
        this.material.transparencyMode = 3; // Alpha blend
        this.material.diffuseTexture = this.texture;
        this.material.backFaceCulling = false;
        const size = this.texture.getSize();

        const ctx = this.texture.getContext();
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(0, 0, size.width, size.height);
        this.texture.update();
    }

}

export class WireframeViewMode extends AbstractTool {

    constructor(private babylonViewer: BabylonViewer) {
        super("Wireframe", "fa-solid fa-border-none");
    }

    onActivate(): void { 
        forMeshes(this.babylonViewer, m => m.material.wireframe = true);
    }

    onDeactivate(): void { 
        forMeshes(this.babylonViewer, m => m.material.wireframe = false);
    }

    onRoomChanged(): void { }

}

/**
 * Helper function to iterate over all child meshes of all models of this instance
 * @param babylonViewer The babylonvier of the instance
 * @param callback Function to be executed on every child mesh of every model of this instance
 */
function forMeshes(babylonViewer: BabylonViewer, callback: (mesh: BABYLON.AbstractMesh) => void) {
    for (let model of babylonViewer.models) {
        for (let mesh of model.getChildMeshes()) {
            callback(mesh);
        }
    }
}