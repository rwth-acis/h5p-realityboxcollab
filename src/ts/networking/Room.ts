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
                this.user = {
                    username: "User " + Math.round(100 * Math.random()),
                    role: create ? Role.HOST : Role.USER
                };
                this.users = this.doc.getArray("users");
                if (create) {
                    this.users.delete(0, this.users.length); // Debug
                }
                this.users.push([this.user]);
                this.users.observeDeep((e, a) => {
console.log(e);
                });

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

    applyUpdate() {
        Y.applyUpdate(this.doc, Y.encodeStateAsUpdate(this.doc));
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