import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { AdvancedDynamicTexture, ColorPicker, Control, StackPanel, TextBlock } from "@babylonjs/gui";
import { RealityBoxCollab } from "../RealityboxCollab";
import { Utils } from "../utils/Utils";
import { AbstractMultiTool, SubTool } from "./AbstractMultiTool";
import { OrbitTool } from "./viewer/OrbitTool";
import { PaintViewMode } from "./viewModes/ViewModes";


export class DrawTool extends AbstractMultiTool {

    static readonly DEFAULT_COLOR = new BABYLON.Color3(1, 0, 0); // Red

    lineMeshes: BABYLON.Mesh[] = [];
    lineMeshSize: number[] = [];
    lastPosition: BABYLON.Vector3;
    frame: number = 0;
    draw: boolean = false;
    initTools: boolean = false;
    lineIndex: number = 0;
    sharedDrawInformation: SharedDrawInformation;
    syncIn: number = -1;
    drawColor: BABYLON.Color3 = DrawTool.DEFAULT_COLOR;
    uiPanel: any;

    // Color picker: https://www.babylonjs-playground.com/#91I2RE#1
    constructor(private instance: RealityBoxCollab, container: JQuery, private orbitTool: OrbitTool, private paintViewMode: PaintViewMode) {
        super("Draw Tool", "fa-solid fa-pen", container, [
            { name: "Mat Paint", icon: "fa-solid fa-paintbrush" },
            { name: "Air Paint", icon: "fa-solid fa-compass-drafting" }
        ], s => s.canUsePenTool);

        this.instance.babylonViewer.scene.registerBeforeRender(() => {
            this.updateSharedTexture();

            if (this.syncIn > 0) {
                this.syncIn--;
                if (this.syncIn == 0) this.writeDrawInfo();
            }
        });

        this.createColorPicker();
    }

    onSubToolSwitched(subtool: SubTool): void {
        if (subtool) {
            this.paintViewMode.toolbar.activateTool(this.paintViewMode);
            this.uiPanel.isVisible = true;
        }
        else this.uiPanel.isVisible = false;

        if (!this.initTools) {
            const scene = this.instance.realitybox.viewer._babylonBox.scene;
            scene.onPointerObservable.add(e => {
                if (e.type == BABYLON.PointerEventTypes.POINTERDOWN && e.event.button == 0) {
                    this.sharedDrawInformation.lines.push({
                        path: [],
                        color: this.drawColor
                    });
                    this.lineIndex = this.sharedDrawInformation.lines.length - 1;
                    this.draw = true;
                }
                else if (e.type == BABYLON.PointerEventTypes.POINTERUP && e.event.button == 0) {
                    this.draw = false;
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

        const line = this.sharedDrawInformation.lines[this.lineIndex];
        line.path.push(pos);
        this.updateLine(this.lineIndex);
        this.writeDrawInfo();
    }

    drawMat(scene: BABYLON.Scene) {
        let pick = scene.pick(scene.pointerX, scene.pointerY);
        let texCoordinates = pick.getTextureCoordinates();
        if (!texCoordinates) return;

        const ctx = this.paintViewMode.texture.getContext();
        const size = this.paintViewMode.texture.getSize();

        ctx.beginPath();
        ctx.arc(texCoordinates.x * size.width, size.height - texCoordinates.y * size.height, 5, 0, 2 * Math.PI, false);

        const c = this.drawColor;
        ctx.fillStyle = `rgb(${c.r * 255}, ${c.g * 255}, ${c.b * 255})`;
        ctx.fill();

        if (this.syncIn <= 0) this.syncIn = 10; // Avoid lags
        this.paintViewMode.texture.update();
    }

    updateLine(index: number): void {
        const scene = this.instance.babylonViewer.scene;
        const line = this.sharedDrawInformation.lines[index];

        // Performance optimization: If line has not changed, keep it
        if (this.lineMeshSize.length > index && line.path.length == this.lineMeshSize[index]) return;
        if (this.lineMeshes[index]) scene.removeMesh(this.lineMeshes[index]);


        this.lineMeshSize[index] = line.path.length;

        if (line.path.length < 2) return;

        // Updatable not possible, because position size changes
        this.lineMeshes[index] = BABYLON.MeshBuilder.CreateTube("tube", {
            path: line.path.map(v => Utils.createVector(v)),
            radius: 0.01,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, scene);
        this.lineMeshes[index].setParent(this.instance.babylonViewer.baseNode);

        let mat = new BABYLON.StandardMaterial("matDrawPen", this.instance.realitybox.viewer._babylonBox.scene);
        mat.diffuseColor = Utils.createColor(line.color);
        this.lineMeshes[index].material = mat;
    }

    override onRoomChanged(): void {
        this.sharedDrawInformation = undefined; // Reset
    }

    private updateSharedTexture(): void {
        let data = this.currentRoom.doc.getMap().get("DrawToolTexture") as SharedDrawInformation;
        if (data && (!this.sharedDrawInformation || this.sharedDrawInformation.lastUpdate != data.lastUpdate)) {
            this.sharedDrawInformation = data;
            const ctx = this.paintViewMode.texture.getContext();
            let r = this.sharedDrawInformation.texture;
            ctx.putImageData(new ImageData(new Uint8ClampedArray(r.data), r.width, r.height), 0, 0);
            this.paintViewMode.texture.update();

            for (let x = 0; x < this.sharedDrawInformation.lines.length; x++) {
                this.updateLine(x);
            }
        }
        else if (!data) {
            this.writeDrawInfo();
        }
    }

    private writeDrawInfo() {
        const ctx = this.paintViewMode.texture.getContext();
        const size = this.paintViewMode.texture.getSize();

        if (!this.sharedDrawInformation) {
            this.sharedDrawInformation = {
                texture: undefined,
                lastUpdate: undefined,
                lines: []
            };
        }

        let t = ctx.getImageData(0, 0, size.width, size.height);
        let data: number[] = [];
        t.data.forEach(x => data.push(x));
        this.sharedDrawInformation.texture = {
            width: t.width,
            height: t.height,
            data: data
        };
        this.sharedDrawInformation.lastUpdate = Date.now();
        this.currentRoom.doc.getMap().set("DrawToolTexture", this.sharedDrawInformation);
    }

    private createColorPicker() {
        let ui = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.instance.babylonViewer.scene as any);

        this.uiPanel = new StackPanel();
        this.uiPanel.width = "200px";
        this.uiPanel.isVertical = true;
        this.uiPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.uiPanel.left = "400 px";
        this.uiPanel.top = "50 px";
        this.uiPanel.isVisible = false;
        ui.addControl(this.uiPanel);

        var picker = new ColorPicker();
        picker.value = DrawTool.DEFAULT_COLOR;
        picker.height = "150px";
        picker.width = "150px";
        picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        picker.onValueChangedObservable.add((value: BABYLON.Color3) => { // value is a color3
            this.drawColor = value;
        });

        this.uiPanel.addControl(picker);
    }
}

interface SharedDrawInformation {
    texture: Texture;
    lastUpdate: number;
    lines: Line[];
}

interface Line {
    path: BABYLON.Vector3[];
    color: BABYLON.Color3;
}

interface Texture {
    width: number;
    height: number;
    data: number[];
}