import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { MaterialHelper, StandardMaterial } from "@babylonjs/core/Legacy/legacy";
import { CustomMaterial, MixMaterial } from "@babylonjs/materials";
import { RealityBoxCollab } from "../RealityboxCollab";
import { Utils } from "../utils/Utils";
import { AbstractMultiTool, SubTool } from "./AbstractMultiTool";
import { AbstractTool } from "./AbstractTool";


export class DrawTool extends AbstractMultiTool {

    line: BABYLON.Mesh;
    linePositions: BABYLON.Vector3[] = [];
    lastPosition: BABYLON.Vector3;
    frame: number = 0;
    mat: BABYLON.StandardMaterial;
    draw: boolean = false;
    initTools: boolean = false;
    texture: BABYLON.DynamicTexture;

    constructor(container: JQuery) {
        super("Draw Tool", "fa-solid fa-pen", container, [
            { name: "Mat Paint", icon: "fa-solid fa-paintbrush" },
            { name: "Air Paint", icon: "fa-solid fa-compass-drafting" }
        ], s => s.canUsePenTool);

        this.mat = new BABYLON.StandardMaterial("matDrawPen", RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene);
        this.mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
    }

    onSubToolSwitched(subtool: SubTool): void {
        if (!this.initTools) {
            const scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;
            this.initMatPaint();
            scene.onPointerObservable.add(e => {
                if (e.type == BABYLON.PointerEventTypes.POINTERDOWN && e.event.button == 0) {
                    this.draw = true;
                }
                else if (e.type == BABYLON.PointerEventTypes.POINTERUP && e.event.button == 0) {
                    this.draw = false;
                    // Reste line but do not remove
                    this.line = null;
                    this.linePositions = [];
                }
                else if (e.type == BABYLON.PointerEventTypes.POINTERMOVE && this.draw) {
                    if (this.active) {
                        if (this.activeTool == this.subtools[0]) this.drawMat(scene);
                        if (this.activeTool == this.subtools[1]) this.drawAir(scene);
                    }
                }
            });
            this.initTools = true;
        }
    }

    // https://www.babylonjs-playground.com/#9MPPSY#5
    // https://doc.babylonjs.com/divingDeeper/materials/using/multiMaterials
    initMatPaint() {
        const scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;
        const model = RealityBoxCollab.instance.realitybox.viewer._babylonBox.model.env;

        this.texture = new BABYLON.DynamicTexture("dynTex1", {
            width: 512,
            height: 512
        }, scene, true);
        let mat = new BABYLON.StandardMaterial("texMat", scene);
        mat.transparencyMode = 3; // Alpha blend
        mat.diffuseTexture = this.texture;
        mat.backFaceCulling = false;
        const size = this.texture.getSize();

        const ctx = this.texture.getContext();
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(0, 0, size.width, size.height);
        this.texture.update();

        const meshes = model.getChildMeshes();
        meshes.forEach(m => m.material = mat);
    }

    drawAir(scene: BABYLON.Scene) {
        let pick = scene.pick(scene.pointerX, scene.pointerY);
        let pos = pick.ray.origin.add(pick.ray.direction.scale(1));
        if (this.lastPosition && Utils.vectorEquals(this.lastPosition, pos)) return;
        this.lastPosition = pos;

        this.linePositions.push(pos);
        if (this.linePositions.length >= 2) this.updateLine(scene);
    }

    drawMat(scene: BABYLON.Scene) {
        let pick = scene.pick(scene.pointerX, scene.pointerY);
        let texCoordinates = pick.getTextureCoordinates();
        if (!texCoordinates) return;

        const ctx = this.texture.getContext();
        const size = this.texture.getSize();

        ctx.beginPath();
        ctx.arc(texCoordinates.x * size.width, size.height - texCoordinates.y * size.height, 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#ff0000"; // Red
        ctx.fill();
        this.texture.update();
    }

    updateLine(scene: BABYLON.Scene): void {
        if (this.line) scene.removeMesh(this.line);

        // Updatable not possible, because position size changes
        this.line = BABYLON.MeshBuilder.CreateTube("tube", {
            path: this.linePositions,
            radius: 0.01,
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