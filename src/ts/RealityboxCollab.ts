import { AbstractGuiElement } from './gui/AbstractGuiElement';
import { BabylonViewer } from './gui/BabylonViewer';
import { Chat } from './gui/Chat';
import { Popups } from "./gui/popup/Popups";
import { Settings } from './gui/Settings';
import { Toolbar } from './gui/Toolbar';
import { Evaluation } from "./networking/Evaluation";
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

    public static readonly SIGNALING_SERVER: string = "ws://buche.informatik.rwth-aachen.de:8529";
    public static readonly EVALUATION_SERVER: string = "http://localhost:8080"; //"http://buche.informatik.rwth-aachen.de:8080";
    public static readonly EVALUATION_MODE: boolean = true;

    // Tools
    drawTool: DrawTool;
    orbitTool: OrbitTool;
    paintViewMode: PaintViewMode;
    annotationTool: AnnotationTool;
    pointerTool: PointerTool;
    moveTool: MoveTool;
    vrTool: VRTool;
    firstPersonTool: FirstPersonTool;
    // View Modes
    wireframeViewMode: WireframeViewMode;
    normalViewMode: NormalViewMode;
    evaluation: Evaluation;
    // Toolbars
    toolbar: Toolbar;
    viewToolbar: Toolbar;
    viewModesToolbar: Toolbar;
    // Other properties
    realitybox: Realitybox;
    options: any;
    guiElements: AbstractGuiElement[];
    chat: Chat;
    roomManager: RoomManager;
    room: Room;
    localRoom: Room;
    babylonViewer: BabylonViewer;
    inputManager: InputManager;

    /**
     * Creates a new instance of RealityboxCollab (invoked by the underlying H5P system)
     * @param options The H5P options
     * @param id The H5P id
     */
    constructor(options: any, public id: any) {
        this.options = options.realityboxcollab;

        this.roomManager = new RoomManager();
    }

    /**
     * Called when this H5P instance is attached. Will create a Realitybox instance and wait for the viewer to be opened.´
     * If query parameters are set, the viewer might be opened automatically.
     * @param $container The container for this H5P instance
     */
    async attach($container: JQuery) {
        // Hide Realityboxs VR Button
        this.options.hideVrButton = true;

        this.realitybox = H5P.newRunnable({
            library: 'H5P.RealityBox 1.2',
            params: { realitybox: this.options },
            metadata: undefined
        }, this.id, undefined, undefined, { parent: this });

        await this.realitybox.attach($container);

        this.realitybox.viewer = this.realitybox._viewer;
        this.realitybox._viewer = new Proxy(this.realitybox._viewer, {
            set: this.onPropertySet.bind(this)
        });

        setTimeout(() => {
            let join = Utils.extractURLOptions();
            if (join && join.viewer == this.id) {
                this.realitybox.viewer.show();
                this.buildComponents((this.realitybox.viewer as any).$el);
                let info = this.roomManager.getRoom(join.room);
                if (!info || info.password !== join.password) {
                    Popups.alert("Invalid roomname or password")
                    return;
                }
                this.room = new Room(this, this.getListeners(), info, false, undefined, false);
            }
        }, 500); // Wait for init, e.g. RoomManager to connect
    }

    /**
     * Workaround for Realitybox by replacing its viewer with a proxy. This method is executed when a property of the Realitbox Viewer is set.
     * This method will execute {@link RealityBoxCollab.buildComponents} when '$el' of the viewer has been set. 
     * @param target The viewer
     * @param key The key of the target which has been assigned to a value
     * @param value The assignment value
     * @returns Always true
     */
    onPropertySet(target: any, key: string, value: any): boolean {
        if (key === "$el") this.buildComponents(value); // Trigger init
        target[key] = value;
        return true;
    }

    /**
     * Creates all tools and toolbars
     * @param container The container which is used to attach e.g. the toolbars to
     */
    buildComponents(container: JQuery): void {
        // Some tools need reference to others
        this.babylonViewer = new BabylonViewer(this);

        // Main Toolbar
        this.orbitTool = new OrbitTool(this);
        this.drawTool = new DrawTool(this, container);
        this.annotationTool = new AnnotationTool(this, container);
        this.pointerTool = new PointerTool(this, container);
        this.moveTool = new MoveTool(this, container);

        // View Tools
        this.vrTool = new VRTool(this);
        this.firstPersonTool = new FirstPersonTool(this);

        // View Modes
        this.normalViewMode = new NormalViewMode(this.babylonViewer);
        this.paintViewMode = new PaintViewMode(this.babylonViewer);
        this.wireframeViewMode = new WireframeViewMode(this.babylonViewer);

        // Create Toolbars
        this.toolbar = new Toolbar(container, "collabToolbar", false, [
            this.moveTool, this.pointerTool, this.annotationTool, this.drawTool
        ]);

        // Navigation modes
        let viewTools: AbstractTool[] = [this.orbitTool, this.vrTool];
        if (!Utils.isMobile) viewTools = [this.firstPersonTool, ...viewTools];
        if (Utils.isMobile) viewTools = [...viewTools, new ARTool(this)];
        this.viewToolbar = new Toolbar(container, "collabViewToolbar", true, viewTools);

        // ViewModes
        this.viewModesToolbar = new Toolbar(container, "collabViewModeToolbar", true, [
            this.normalViewMode, this.paintViewMode, this.wireframeViewMode
        ]);

        this.chat = new Chat(container);
        this.guiElements = [this.viewToolbar, this.toolbar, this.chat, new Settings(this, container), this.viewModesToolbar];
        this.inputManager = new InputManager(this.babylonViewer);
        this.guiElements.forEach(e => e.init());
        this.babylonViewer.registerToolbar(this.toolbar);

        // Create a local room (used when not in a remote room)
        this.room = this.localRoom = new Room(this, this.getListeners(), {
            name: "Local Room",
            password: "",
            settings: DEFAULT_SETTINGS
        }, true, undefined, true);

        // Create the evaluation object
        this.evaluation = new Evaluation(this);

        // Set Title
        setTimeout(() => document.getElementById("mainTitle").innerHTML = "RealityBoxCollab", 500)
    }

    /**
     * Returns all objects which are NetworkListeners and should be notified on changes
     * @returns The listeners
     */
    getListeners(): NetworkListener[] {
        return [...this.guiElements, this.babylonViewer];
    }

}