import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

/**
 * The room manager is used to check whether rooms already exist and for password validation
 */
export class RoomManager {
    doc: Y.Doc;
    rooms: Y.Map<RoomInformation>;

    constructor() {
        this.doc = new Y.Doc();
        const wsProvider = new WebsocketProvider('ws://localhost:1234', "RealityboxCollabRooms", this.doc);

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
     */
    createRoom(name: string, password: string): RoomInformation {
        if (this.getRoom(name)) return null;
        
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