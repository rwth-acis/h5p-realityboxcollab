import { Room } from "./Room";

/**
 * NetworkListener is used for all classes such as tools, which need a reference to the active room and need to be notified of certain events such as when the room changes
 */
export abstract class NetworkListener {
    /** Reference to the current room. Never null or undefined (might reference the local room) */
    currentRoom: Room;

    /**
     * Called when the room changes after currentRoom is updated
     */
    abstract onRoomChanged(): void;

    /**
     * Called by the room whenever the settings object is changed
     */
    onSettingsChanged(): void {};

}