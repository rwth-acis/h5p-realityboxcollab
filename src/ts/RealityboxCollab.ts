import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { AbstractGuiElement } from './gui/AbstractGuiElement';
import { BabylonViewer } from './gui/BabylonViewer';
import { Chat } from './gui/Chat';
import { Settings } from './gui/Settings';
import { Toolbar } from './gui/Toolbar';
import { NetworkListener } from './networking/NetworkListener';
import { Room } from './networking/Room';
import { RoomManager } from './networking/RoomManager';
import { DEFAULT_SETTINGS } from "./networking/RoomSettings";
import { Realitybox } from './RealityboxTypes';
import { AbstractTool } from "./tools/AbstractTool";
import { AnnotationTool } from './tools/AnnotationTool';
import { DrawTool } from './tools/DrawTool';
import { MoveTool } from './tools/MoveTool';
import { PointerTool } from './tools/PointerTool';
import { ARTool } from './tools/viewer/ARTool';
import { FirstPersonTool } from './tools/viewer/FirstPersonTool';
import { OrbitTool } from './tools/viewer/OrbitTool';
import { VRTool } from './tools/viewer/VRTool';
import { NormalViewMode, PaintViewMode, WireframeViewMode } from "./tools/viewModes/ViewModes";
import { InputManager } from "./utils/InputManager";
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
    inputManager: InputManager;

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
        // Some tools need reference to others
        this.babylonViewer = new BabylonViewer(this);

        let paintViewMode = new PaintViewMode(this.babylonViewer);
        let orbitTool = new OrbitTool(this);
        let drawTool = new DrawTool(this, container, orbitTool, paintViewMode);

        let toolbar = new Toolbar(container, "collabToolbar", false, [
            new MoveTool(this, container), new PointerTool(this, container), new AnnotationTool(this), drawTool
        ]);

        let viewTools: AbstractTool[] = [orbitTool, new VRTool(this.babylonViewer)];
        if (!Utils.isMobile) viewTools = [new FirstPersonTool(this), ...viewTools];
        if (Utils.isMobile) viewTools = [...viewTools, new ARTool(this.babylonViewer)];

        let viewToolbar = new Toolbar(container, "collabViewToolbar", true, viewTools);
        let viewModesToolbar = new Toolbar(container, "collabViewModeToolbar", true, [
            new NormalViewMode(this.babylonViewer), paintViewMode, new WireframeViewMode(this.babylonViewer)
        ]);

        this.chat = new Chat(container);
        this.guiElements = [viewToolbar, toolbar, this.chat, new Settings(this, container), viewModesToolbar];
        this.inputManager = new InputManager(this.babylonViewer);
        this.guiElements.forEach(e => e.init());
        this.babylonViewer.registerToolbar(toolbar);

        let a = this.realitybox.viewer._babylonBox.getAnnotations();
        if (a.length > 0) {
            this.realitybox.viewer._babylonBox.addAnnotation({
                content: a[0].content,
                normalRef: new BABYLON.Vector3(0, 1, 0),
                position: new BABYLON.Vector3(1, 0, 2)
            });
        }

        this.room = this.localRoom = new Room(this, this.getListeners(), {
            name: "Local Room",
            password: "",
            settings: DEFAULT_SETTINGS
        }, true, true);
    }

    getListeners(): NetworkListener[] {
        return [...this.guiElements, this.babylonViewer];
    }

}