import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { RealityBoxCollab } from "../RealityboxCollab";
import { InputManager } from "../utils/InputManager";
import { Utils } from "../utils/Utils";
import { AbstractMultiTool, SubTool } from "./AbstractMultiTool";
import { OrbitTool } from "./viewer/OrbitTool";


export class DrawTool extends AbstractMultiTool {

    lineMesh: BABYLON.Mesh;
    linePositions: BABYLON.Vector3[] = [];
    lastPosition: BABYLON.Vector3;
    frame: number = 0;
    mat: BABYLON.StandardMaterial;
    draw: boolean = false;
    initTools: boolean = false;
    texture: BABYLON.DynamicTexture;

    constructor(private instance: RealityBoxCollab, container: JQuery, private orbitTool: OrbitTool) {
        super("Draw Tool", "fa-solid fa-pen", container, [
            { name: "Mat Paint", icon: "fa-solid fa-paintbrush" },
            { name: "Air Paint", icon: "fa-solid fa-compass-drafting" }
        ], s => s.canUsePenTool);

        this.mat = new BABYLON.StandardMaterial("matDrawPen", this.instance.realitybox.viewer._babylonBox.scene);
        this.mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
    }

    onSubToolSwitched(subtool: SubTool): void {
        if (!this.initTools) {
            const scene = this.instance.realitybox.viewer._babylonBox.scene;
            this.initMatPaint();
            scene.onPointerObservable.add(e => {
                if (e.type == BABYLON.PointerEventTypes.POINTERDOWN && e.event.button == 0
                    && (!this.orbitTool.active || this.instance.inputManager.isKeyDown(InputManager.KEY_D))) {
                    this.draw = true;
                }
                else if (e.type == BABYLON.PointerEventTypes.POINTERUP && e.event.button == 0) {
                    this.draw = false;
                    // Reste line but do not remove
                    this.lineMesh = null;
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
        const scene = this.instance.realitybox.viewer._babylonBox.scene;
        const model = this.instance.realitybox.viewer._babylonBox.model.env;

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
        console.log(meshes[0].material);
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
        if (this.lineMesh) scene.removeMesh(this.lineMesh);

        // Updatable not possible, because position size changes
        this.lineMesh = BABYLON.MeshBuilder.CreateTube("tube", {
            path: this.linePositions,
            radius: 0.01,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, scene);
        this.lineMesh.setParent(this.instance.babylonViewer.baseNode);

        this.lineMesh.material = this.mat;
    }

    override onRoomChanged(): void {

    }
}