import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

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

    createRoom(name: string, password: string): RoomInformation {
        if (this.getRoom(name)) {
            return null;
        }
        let info: RoomInformation = {
            name: name,
            password: password
        }
        this.rooms.set(name, info);

        return info;
    }

    getRoom(name: string) {
        return this.rooms.get(name);
    }
}

export interface RoomInformation {
    name: string;
    password: string;
}