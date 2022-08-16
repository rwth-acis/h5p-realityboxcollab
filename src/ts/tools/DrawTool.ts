import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { AdvancedDynamicTexture, ColorPicker, Control, StackPanel } from "@babylonjs/gui";
import { XRState } from "../gui/BabylonViewer";
import { RealityBoxCollab } from "../RealityboxCollab";
import { Utils } from "../utils/Utils";
import { AbstractMultiTool, SubTool } from "./AbstractMultiTool";

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
    picker: ColorPicker;

    /**
     * Construct a DrawTool
     * @param instance The main instance of RealityboxCollab 
     * @param container The container for the multi tool
     */
    constructor(private instance: RealityBoxCollab, container: JQuery) {
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

    onSubToolSwitched(subtool: SubTool) {
        if (subtool) {
            this.instance.paintViewMode.toolbar.activateTool(this.instance.paintViewMode);
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
                else if (e.type == BABYLON.PointerEventTypes.POINTERMOVE && this.draw && this.active) {
                    if (this.activeTool == this.subtools[0]) this.drawMat(scene);
                    if (this.activeTool == this.subtools[1]) this.drawAir(scene);
                }
            });
            this.initTools = true;
        }

        // Disable input of orbit tool while this tool is active
        if (this.instance.orbitTool.active) {
            if (subtool) this.instance.orbitTool.forceDisableInput();
            else this.instance.orbitTool.enableInput();
        }
    }


    private drawAir(scene: BABYLON.Scene) {
        let pick = this.pickDrawPoint(scene);

        let pos = pick.ray.origin.add(pick.ray.direction.scale(1));
        if (this.lastPosition && Utils.vectorEquals(this.lastPosition, pos)) return;
        this.lastPosition = pos;

        const line = this.sharedDrawInformation.lines[this.lineIndex];
        line.path.push(Utils.getRelativePosition(this.instance.babylonViewer, pos));
        this.updateLine(this.lineIndex);
        this.writeDrawInfo();
    }

    private drawMat(scene: BABYLON.Scene) {
        let pick = this.pickDrawPoint(scene);

        let texCoordinates = pick.getTextureCoordinates();
        if (!texCoordinates) return;

        const ctx = this.instance.paintViewMode.texture.getContext();
        const size = this.instance.paintViewMode.texture.getSize();

        ctx.beginPath();
        ctx.arc(texCoordinates.x * size.width, size.height - texCoordinates.y * size.height, 5, 0, 2 * Math.PI, false);

        const c = this.drawColor;
        ctx.fillStyle = `rgb(${c.r * 255}, ${c.g * 255}, ${c.b * 255})`;
        ctx.fill();

        if (this.syncIn <= 0) this.syncIn = 10; // Avoid lags, sync every 10 frames
        this.instance.paintViewMode.texture.update();
    }

    private updateLine(index: number) {
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
        this.lineMeshes[index].parent = this.instance.babylonViewer.baseNode;

        let mat = new BABYLON.StandardMaterial("matDrawPen", this.instance.realitybox.viewer._babylonBox.scene);
        mat.diffuseColor = Utils.createColor(line.color);
        this.lineMeshes[index].material = mat;
    }

    /**
     * Remove line meshes
     */
    override onRoomChanged() {
        this.lineMeshes.forEach(m => this.instance.babylonViewer.scene.removeMesh(m));
        this.lineMeshes = [];
        this.sharedDrawInformation = undefined; // Reset
    }

    private pickDrawPoint(scene: BABYLON.Scene): BABYLON.PickingInfo {
        if (this.instance.babylonViewer.xrState == XRState.VR) {
            return this.instance.inputManager.pickWithPointer();
        }
        else {
            return scene.pick(scene.pointerX, scene.pointerY);
        }
    }

    /**
     * Update the drawing information in case another user has updated it
     */
    private updateSharedTexture() {
        let data = this.currentRoom.doc.getMap().get("DrawToolTexture") as SharedDrawInformation;
        if (data && (!this.sharedDrawInformation || this.sharedDrawInformation.lastUpdate != data.lastUpdate)) {
            this.sharedDrawInformation = data;
            const ctx = this.instance.paintViewMode.texture.getContext();
            let r = this.sharedDrawInformation.texture;
            ctx.putImageData(new ImageData(new Uint8ClampedArray(r.data), r.width, r.height), 0, 0);
            this.instance.paintViewMode.texture.update();

            for (let x = 0; x < this.sharedDrawInformation.lines.length; x++) {
                this.updateLine(x);
            }
        }
        else if (!data) {
            this.writeDrawInfo();
        }
    }

    /**
     * Write out the draw information to the other user
     */
    private writeDrawInfo() {
        const ctx = this.instance.paintViewMode.texture.getContext();
        const size = this.instance.paintViewMode.texture.getSize();

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

    /**
     * Create the UI for the color picker
     */
    private createColorPicker() {
        let ui = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.instance.babylonViewer.scene as any);

        this.uiPanel = new StackPanel();
        this.uiPanel.isVertical = true;
        this.uiPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.uiPanel.left = "300 px";
        this.uiPanel.top = "50 px";
        this.uiPanel.isVisible = false;
        ui.addControl(this.uiPanel);

        this.picker = new ColorPicker();
        this.picker.value = DrawTool.DEFAULT_COLOR;
        this.setPickerState(false);
        this.picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.picker.onValueChangedObservable.add((value: BABYLON.Color3) => { // value is a color3
            this.drawColor = value;
        });

        this.uiPanel.addControl(this.picker);
    }

    /**
     * Update the color picker depending on the XR State
     * @param inXR Whether the instance is currently in XR
     */
    setPickerState(inXR: boolean) {
        const n = inXR ? 400 : 150;
        this.uiPanel.height = n + "px";
        this.uiPanel.width = n + "px";
        this.picker.height = n + "px";
        this.picker.width = n + "px";
    }
}

/**
 * Shared Information for all draw tools synced between the users (general, not per user)
 */
interface SharedDrawInformation {
    texture: Texture;
    lastUpdate: number;
    lines: Line[];
}

/**
 * Represents a line of the draw tool
 */
interface Line {
    path: BABYLON.Vector3[];
    color: BABYLON.Color3;
}

/**
 * TextureInformation to sync to the other users
 */
interface Texture {
    width: number;
    height: number;
    data: number[];
}