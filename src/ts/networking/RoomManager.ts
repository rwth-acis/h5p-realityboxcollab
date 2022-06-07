import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

/**
 * The room manager is used to check whether rooms already exist and for password validation
 */
export class RoomManager {
    doc: Y.Doc;
    rooms: Y.Map<RoomInformation>;

    constructor() {
        this.doc = new Doc();
        const wsProvider = new WebsocketProvider('ws://192.168.0.10:1234', "RealityboxCollabRooms", this.doc);

        wsProvider.on('status', (event: any) => {
            if (event.status === "connected") {
                this.rooms = this.doc.getMap("rooms");
            }
            else if (event.status === "disconnected") {

            }
        });
    }

    /**
     * Create a new room
     * @param name The name for the room
     * @param password The password used to join the room
     * @returns The RoomInformation for the newly created room 
     * or null if no room could be created because the name is already in use 
     * or the signaling server could not be reached
     */
    createRoom(name: string, password: string): RoomInformation {
        if (!this.rooms) {
            alert("Cannot reach signaling server");
            return null;
        }
        if (this.getRoom(name)) {
            alert("Unable to create room: Name already in use");
            return null;
        }

        let info: RoomInformation = {
            name: name,
            password: password
        }
        this.rooms.set(name, info);

        return info;
    }

    /**
     * Get a room by its name
     * @param name The name of the room
     * @returns The room or undefined if no such room exists
     */
    getRoom(name: string) {
        return this.rooms.get(name);
    }
}

/**
 * Represents a RealityBoxCollab room
 */
export interface RoomInformation {
    name: string;
    password: string;
}