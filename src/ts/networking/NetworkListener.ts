import { Room } from "./Room";

export abstract class NetworkListener {
    /** Reference to the current room. Never null or undefined (might reference the local room) */
    currentRoom: Room;

    /**
     * Called when the room changes after currentRoom is updated
     */
    abstract onRoomChanged(): void;
}