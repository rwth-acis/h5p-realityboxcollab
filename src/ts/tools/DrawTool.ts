import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { MaterialHelper, StandardMaterial } from "@babylonjs/core/Legacy/legacy";
import { CustomMaterial, MixMaterial } from "@babylonjs/materials";
import { RealityBoxCollab } from "../RealityboxCollab";
import { Utils } from "../utils/Utils";
import { AbstractTool } from "./AbstractTool";


export class DrawTool extends AbstractTool {
    line: BABYLON.Mesh;
    positions: BABYLON.Vector3[] = [];
    lastPosition: BABYLON.Vector3;
    frame: number = 0;
    mat: BABYLON.StandardMaterial;
    draw: boolean = false;

    constructor() {
        super("Draw Tool", "fa-solid fa-pen", s => s.canUsePenTool);

        this.mat = new BABYLON.StandardMaterial("matDrawPen", RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene);
        this.mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
    }

    override onActivate(): void {
        this.test();
        if (true) return;

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

    // https://www.babylonjs-playground.com/#9MPPSY#5
    // https://doc.babylonjs.com/divingDeeper/materials/using/multiMaterials
    test() {
        const scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;
        const model = RealityBoxCollab.instance.realitybox.viewer._babylonBox.model.env;

        let texture = new BABYLON.DynamicTexture("dynTex1", {
            width: 512,
            height: 512
        }, scene, true);
        let mat = new BABYLON.StandardMaterial("texMat", scene);
        mat.transparencyMode = 3; // Alpha blend
        mat.diffuseTexture = texture;
        mat.backFaceCulling = false;
        const size = texture.getSize();

        const ctx = texture.getContext();
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(0, 0, size.width, size.height);
        texture.update();

        const meshes = model.getChildMeshes();
        meshes.forEach(m => m.material = mat);


        scene.onPointerObservable.add(e => {
            if (e.type == BABYLON.PointerEventTypes.POINTERDOWN && e.event.button == 0) {
                this.draw = true;
            }
            else if (e.type == BABYLON.PointerEventTypes.POINTERUP && e.event.button == 0) {
                this.draw = false;
            }
            else if (e.type == BABYLON.PointerEventTypes.POINTERMOVE && this.draw) {
                let pick = scene.pick(scene.pointerX, scene.pointerY);
                //mesh => meshes.find(c => c == mesh) != undefined);
                let texCoordinates = pick.getTextureCoordinates();
                if (!texCoordinates) return;

                ctx.beginPath();
                ctx.arc(texCoordinates.x * size.width, size.height - texCoordinates.y * size.height, 5, 0, 2 * Math.PI, false);
                ctx.fillStyle = "#ff0000"; // Red
                ctx.fill();
                texture.update();
            }
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