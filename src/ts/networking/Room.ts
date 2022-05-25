import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { NetworkListener } from "./NetworkListener";

export class Room {
    
    doc: Y.Doc;
    user: User;
    usernames: Y.Array<string>;
    userData: Y.Map<User>;

    constructor(private listeners: NetworkListener[], public name: string, create: boolean) {
        this.doc = new Y.Doc();
        const wsProvider = new WebsocketProvider('ws://localhost:1234', name, this.doc);
        wsProvider.on('status', (event: any) => {
            if (event.status === "connected") {
                this.user = {
                    username: "User " + Math.round(100 * Math.random()),
                    position: null,
                    role: create ? Role.HOST : Role.USER
                };
                this.usernames = this.doc.getArray("usernames");
                if (create) {
                    this.usernames.delete(0, this.usernames.length); // Debug
                }
                this.usernames.push([this.user.username]);

                this.userData = this.doc.getMap("userdata");
                this.onUserUpdated();

                this.onConnect();
            }
            else if (event.status === "disconnected") {
                this.onDisconnect();
            }
        });
    }

    onConnect() {
        for (let l of this.listeners) {
            l.currentRoom = this;
            l.onRoomChanged();
        }
    }

    onUserUpdated() {
        this.userData.set(this.user.username, this.user);
    }

    onDisconnect() {

    }
}

export interface User {
    username: string;
    role: Role;
    position: BABYLON.Vector3;
}

export enum Role {
    HOST, USER
}