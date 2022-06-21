import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { AbstractGuiElement } from './gui/AbstractGuiElement';
import { BabylonViewer } from './gui/BabylonViewer';
import { Chat } from './gui/Chat';
import { Settings } from './gui/Settings';
import { Toolbar } from './gui/Toolbar';
import { NetworkListener } from './networking/NetworkListener';
import { Room } from './networking/Room';
import { RoomManager } from './networking/RoomManager';
import { Realitybox, RealityboxAnnotation, RealityBoxEditor } from './RealityboxTypes';
import { AnnotationTool } from './tools/AnnotationTool';
import { DrawTool } from './tools/DrawTool';
import { MoveTool } from './tools/MoveTool';
import { PointerTool } from './tools/PointerTool';
import { ARTool } from './tools/viewer/ARTool';
import { FirstPersonTool } from './tools/viewer/FirstPersonTool';
import { OrbitTool } from './tools/viewer/OrbitTool';
import { VRTool } from './tools/viewer/VRTool';
import { NormalViewMode, PaintViewMode, WireframeViewMode } from "./tools/viewModes/ViewModes";
import { Utils } from './utils/Utils';


declare let H5P: any;
H5P = H5P || {};

export class RealityBoxCollab {

    realitybox: Realitybox;
    options: any;
    guiElements: AbstractGuiElement[];
    chat: Chat;
    roomManager: RoomManager;
    room: Room;
    localRoom: Room;
    babylonViewer: BabylonViewer;

    constructor(options: any, private id: any) {
        this.options = options.realityboxcollab;

        this.roomManager = new RoomManager();
    }

    async attach($container: JQuery) {
        this.realitybox = H5P.newRunnable({
            library: 'H5P.RealityBox 1.0',
            params: { realitybox: this.options },
            metadata: undefined
        }, this.id, undefined, undefined, { parent: this });

        await this.realitybox.attach($container);

        this.realitybox.viewer = this.realitybox._viewer;
        this.realitybox._viewer = new Proxy(this.realitybox._viewer, {
            set: this.onPropertySet.bind(this)
        });
    }

    onPropertySet(target: any, key: string, value: any): boolean {
        if (key === "$el") {
            this.buildComponents(value);
        }
        target[key] = value;
        return true;
    }

    buildComponents(container: JQuery): void {
        let drawTool = new DrawTool(this, container);
        let toolbar = new Toolbar(container, "collabToolbar", false, [
            new MoveTool(this, container), new PointerTool(this, container), new AnnotationTool(), drawTool
        ]);

        let viewTools = [new OrbitTool(), new VRTool(this.babylonViewer)];
        if (!Utils.isMobile) viewTools = [new FirstPersonTool(this), ...viewTools];
        if (Utils.isMobile) viewTools = [...viewTools, new ARTool(this.babylonViewer)];

        let viewToolbar = new Toolbar(container, "collabViewToolbar", true, viewTools);
        let viewModesToolbar = new Toolbar(container, "collabViewModeToolbar", true, [
            new NormalViewMode(this.babylonViewer), new PaintViewMode(this.babylonViewer, drawTool), new WireframeViewMode(this.babylonViewer)
        ]);

        this.chat = new Chat(container);
        this.guiElements = [viewToolbar, toolbar, this.chat, new Settings(this, container), viewModesToolbar];
        this.babylonViewer = new BabylonViewer(this, toolbar);
        this.guiElements.forEach(e => e.init());

        let a = this.realitybox.viewer._babylonBox.getAnnotations();
        if (a.length > 0)
            this.realitybox.viewer._babylonBox.addAnnotation({
                content: a[0].content,
                normalRef: new BABYLON.Vector3(0, 1, 0),
                position: new BABYLON.Vector3()
            });

        this.room = this.localRoom = new Room(this, this.getListeners(), {
            name: "Local Room",
            password: ""
        }, true, true);
    }

    getListeners(): NetworkListener[] {
        return [...this.guiElements, this.babylonViewer];
    }

}