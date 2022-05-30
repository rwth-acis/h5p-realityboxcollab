import * as $ from 'jquery'; // Needed for JQuery to be loaded
import { Settings } from './gui/Settings';
import { Chat } from './gui/Chat';
import { Room } from './networking/Room';
import { AbstractGuiElement } from './gui/AbstractGuiElement';
import { Realitybox } from './RealityboxTypes';
import { PointerTool } from './tools/PointerTool';
import { AnnotationTool } from './tools/AnnotationTool';
import { DrawTool } from './tools/DrawTool';
import { MoveTool } from './tools/MoveTool';
import { FirstPersonTool } from './tools/FirstPersonTool';
import { OrbitTool } from './tools/OrbitTool';
import { Toolbar } from './gui/Toolbar';
import { BabylonViewer } from './gui/BabylonViewer';
import { NetworkListener } from './networking/NetworkListener';
import { RoomManager } from './networking/RoomManager';


declare let H5P: any;
H5P = H5P || {};

export class RealityBoxCollab {
    static instance: RealityBoxCollab;

    realitybox: Realitybox;
    options: any;
    guiElements: AbstractGuiElement[];
    otherElements: NetworkListener[];
    chat: Chat;
    roomManager: RoomManager;
    room: Room;

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

    onPropertySet(target: any, key: string, value: any) {
        if (key === "$el") {
            this.buildComponents(value);
        }
        target[key] = value;
        return true;
    }

    buildComponents(container: JQuery) {
        let toolbar = new Toolbar(container, "collabToolbar", false, [
            new MoveTool(container), new PointerTool(), new AnnotationTool(), new DrawTool()
        ]);
        let viewToolbar = new Toolbar(container, "collabViewToolbar", true, [
            new FirstPersonTool(), new OrbitTool()
        ]);
        this.chat = new Chat(container);
        this.guiElements = [viewToolbar, toolbar, this.chat, new Settings(container)];
        this.otherElements = [new BabylonViewer()];
        this.guiElements.forEach(e => e.init());
    }
}