import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { NetworkListener } from "./NetworkListener";

export class Room {
    doc: Y.Doc;
    user: User;
    users: Y.Array<User>;

    constructor(private listeners: NetworkListener[], public name: string, create: boolean) {
        this.doc = new Y.Doc();
        const wsProvider = new WebsocketProvider('ws://localhost:1234', name, this.doc);
        wsProvider.on('status', (event: any) => {
            if (event.status === "connected") {
                this.onConnect();
            }
            else if (event.status === "disconnected") {
                this.onDisconnect();
            }
        });
    }

    onConnect() {
        this.user = {
            username: "User " + Math.round(100 * Math.random()),
            role: Role.HOST
        };
        this.users = this.doc.getArray("users");
        this.users.push([this.user]);

        for (let l of this.listeners) {
            l.currentRoom = this;
            l.onRoomChanged();
        }
    }

    onDisconnect() {

    }
}

export interface User {
    username: string;
    role: Role;
    position?: BABYLON.Vector3;
}

export enum Role {
    HOST, USER
}