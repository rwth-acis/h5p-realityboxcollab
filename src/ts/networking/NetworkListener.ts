import { Room } from "./Room";

export abstract class NetworkListener {
    currentRoom: Room;

    abstract onRoomChanged(): void;
}