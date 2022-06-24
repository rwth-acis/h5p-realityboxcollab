import { Toolbar } from "../gui/Toolbar";
import { NetworkListener } from "../networking/NetworkListener";
import { Role } from "../networking/Room";
import { RoomSettings } from "../networking/RoomSettings";

/**
 * A tool represents an item for a toolbar which can be selected / activated and deactivated
 */
export abstract class AbstractTool extends NetworkListener {

    /** Denotes whether the tools is currently active */
    active: boolean;
    /** Reference to the underlying toolbar of this tool */
    toolbar: Toolbar;

    /**
     * Create an abstract tool
     * @param name The name of the tool, displayed e.g. in the tooltip of the toolbar
     * @param icon The icon to display in the the toolbar
     * @param setting If set, {@link canActivate} checks wether this function returns true with respect to the current {@link RoomSettings}
     */
    constructor(public name: string, public icon: string, public setting?: (s: RoomSettings) => boolean) {
        super();
    }

    /**
     * Called whenever the tool gets activated by the user or the toolbar
     */
    abstract onActivate(): void

    /**
     * Called when the tool gets deactivated
     */
    abstract onDeactivate(): void;

    /**
     * Checks whether the user can currently use this tool
     * @returns true, if not setting was specified or if the user is {@link Role.HOST} or {@link Role.CO_HOST}. 
     * Otherwise the result of the settings function.
     */
    canActivate(): boolean {
        if (!this.setting) return true;

        return this.currentRoom.user.role == Role.HOST || this.currentRoom.user.role == Role.CO_HOST
            || this.setting(this.currentRoom.roomInfo.settings);
    };

    /**
     * Called by the toolbar when initializing
     * @param toolbar The toolbar reference
     */
    init(toolbar: Toolbar): void {
        this.toolbar = toolbar;
    }
}