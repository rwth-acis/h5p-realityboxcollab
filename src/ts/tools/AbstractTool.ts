import { Toolbar } from "../gui/Toolbar";
import { NetworkListener } from "../networking/NetworkListener";
import { Role } from "../networking/Room";
import { RoomSettings } from "../networking/RoomSettings";

export abstract class AbstractTool extends NetworkListener {

    active: boolean;
    toolbar: Toolbar;

    constructor(public name: string, public icon: string, public setting?: (s: RoomSettings) => boolean) {
        super();
    }

    abstract onActivate(): void
    abstract onDeactivate(): void;
    
    canActivate(): boolean {
        if (!this.setting) return true;

        return this.currentRoom.user.role == Role.HOST || this.currentRoom.user.role == Role.CO_HOST
            || this.setting(this.currentRoom.settings);
    };

    init(toolbar: Toolbar): void {
        this.toolbar = toolbar;
    }
}