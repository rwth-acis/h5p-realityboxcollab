import { AbstractGuiElement } from './gui/AbstractGuiElement';
import { BabylonViewer } from './gui/BabylonViewer';
import { Chat } from './gui/Chat';
import { Settings } from './gui/Settings';
import { Toolbar } from './gui/Toolbar';
import { NetworkListener } from './networking/NetworkListener';
import { Room } from './networking/Room';
import { RoomManager } from './networking/RoomManager';
import { Realitybox } from './RealityboxTypes';
import { AnnotationTool } from './tools/AnnotationTool';
import { DrawTool } from './tools/DrawTool';
import { MoveTool } from './tools/MoveTool';
import { PointerTool } from './tools/PointerTool';
import { ARTool } from './tools/viewer/ARTool';
import { FirstPersonTool } from './tools/viewer/FirstPersonTool';
import { OrbitTool } from './tools/viewer/OrbitTool';
import { VRTool } from './tools/viewer/VRTool';
import { Utils } from './utils/Utils';
import * as BABYLON from "babylonjs"; // Needed, so BabylonJs is packaged
import * as GUI from "babylonjs-gui";


declare let H5P: any;
H5P = H5P || {};

export class RealityBoxCollab {
    static instance: RealityBoxCollab;

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
        if (RealityBoxCollab.instance) {
            throw new Error("Instance already definied");
        }
        RealityBoxCollab.instance = this;

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
        let toolbar = new Toolbar(container, "collabToolbar", false, [
            new MoveTool(container), new PointerTool(), new AnnotationTool(), new DrawTool()
        ]);

        let viewTools = [new OrbitTool(), new VRTool()];
        if (!Utils.isMobile) viewTools = [new FirstPersonTool(), ...viewTools];
        if (Utils.isMobile) viewTools = [...viewTools, new ARTool()];
        
        let viewToolbar = new Toolbar(container, "collabViewToolbar", true, viewTools);

        this.chat = new Chat(container);
        this.guiElements = [viewToolbar, toolbar, this.chat, new Settings(container)];
        this.babylonViewer = new BabylonViewer(toolbar);
        this.guiElements.forEach(e => e.init());
        
        this.room = this.localRoom = new Room(this.getListeners(), {
            name: "Local Room",
            password: ""
        }, true, true);
    }

    getListeners(): NetworkListener[] {
        return [...this.guiElements, this.babylonViewer];
    }
}