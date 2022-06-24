import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { RealityBoxCollab } from "../RealityboxCollab";
import { Utils } from "../utils/Utils";
import { AbstractMultiTool, SubTool } from "./AbstractMultiTool";
import { OrbitTool } from "./viewer/OrbitTool";
import { PaintViewMode } from "./viewModes/ViewModes";


export class DrawTool extends AbstractMultiTool {

    currentLineMesh: BABYLON.Mesh;
    lastPosition: BABYLON.Vector3;
    frame: number = 0;
    mat: BABYLON.StandardMaterial;
    draw: boolean = false;
    initTools: boolean = false;
    ownDrawInformation: DrawInformation;
    lineIndex: number = 0;

    constructor(private instance: RealityBoxCollab, container: JQuery, private orbitTool: OrbitTool, private paintViewMode: PaintViewMode) {
        super("Draw Tool", "fa-solid fa-pen", container, [
            { name: "Mat Paint", icon: "fa-solid fa-paintbrush" },
            { name: "Air Paint", icon: "fa-solid fa-compass-drafting" }
        ], s => s.canUsePenTool);

        this.mat = new BABYLON.StandardMaterial("matDrawPen", this.instance.realitybox.viewer._babylonBox.scene);
        this.mat.diffuseColor = new BABYLON.Color3(1, 0, 0);

        this.ownDrawInformation = {
            positions: [[]],
        };
    }

    onSubToolSwitched(subtool: SubTool): void {
        if (!this.initTools) {
            const scene = this.instance.realitybox.viewer._babylonBox.scene;
            scene.onPointerObservable.add(e => {
                if (e.type == BABYLON.PointerEventTypes.POINTERDOWN && e.event.button == 0) {
                    this.draw = true;
                }
                else if (e.type == BABYLON.PointerEventTypes.POINTERUP && e.event.button == 0) {
                    this.draw = false;
                    // Reste line but do not remove
                    this.currentLineMesh = null;
                    this.lineIndex++;
                    this.ownDrawInformation.positions.push([]);
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

        // Disable input of orbit tool while this tool is active
        if (this.orbitTool.active) {
            if (subtool) this.orbitTool.forceDisableInput();
            else this.orbitTool.enableInput();
        }
    }


    drawAir(scene: BABYLON.Scene) {
        let pick = scene.pick(scene.pointerX, scene.pointerY);
        let pos = pick.ray.origin.add(pick.ray.direction.scale(1));
        if (this.lastPosition && Utils.vectorEquals(this.lastPosition, pos)) return;
        this.lastPosition = pos;

        const line = this.ownDrawInformation.positions[this.lineIndex];
        line.push(pos);
        if (line.length >= 2) this.updateCurrentLine(scene, line);
    }

    drawMat(scene: BABYLON.Scene) {
        let pick = scene.pick(scene.pointerX, scene.pointerY);
        let texCoordinates = pick.getTextureCoordinates();
        if (!texCoordinates) return;

        const ctx = this.paintViewMode.texture.getContext();
        const size = this.paintViewMode.texture.getSize();

        ctx.beginPath();
        ctx.arc(texCoordinates.x * size.width, size.height - texCoordinates.y * size.height, 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#ff0000"; // Red
        ctx.fill();

        ctx.clearRect(0, 0, size.width, size.height);
        this.ownDrawInformation.texture = ctx.getImageData(0, 0, size.width, size.height);
        this.paintViewMode.texture.update();
    }

    updateCurrentLine(scene: BABYLON.Scene, line: BABYLON.Vector3[]): void {
        if (this.currentLineMesh) scene.removeMesh(this.currentLineMesh);

        // Updatable not possible, because position size changes
        this.currentLineMesh = BABYLON.MeshBuilder.CreateTube("tube", {
            path: line,
            radius: 0.01,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, scene);
        this.currentLineMesh.setParent(this.instance.babylonViewer.baseNode);

        this.currentLineMesh.material = this.mat;
    }

    override onRoomChanged(): void {

    }
}

export interface DrawInformation {
    positions: BABYLON.Vector3[][];
    texture?: ImageData;
}