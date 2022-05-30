import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { NetworkListener } from "./NetworkListener";
import { RoomInformation } from "./RoomManager";

export class Room {

    doc: Y.Doc;
    user: User;
    users: Y.Map<User>;

    constructor(private listeners: NetworkListener[], public roomInfo: RoomInformation, create: boolean) {
        this.doc = new Y.Doc();
        const wsProvider = new WebsocketProvider('ws://localhost:1234', "room:" + roomInfo.name, this.doc);
        wsProvider.on('status', (event: any) => {
            if (event.status === "connected") {
                this.users = this.doc.getMap("userdata");
                let username: string = this.askUsername();
                this.user = {
                    username: username,
                    position: null,
                    role: create ? Role.HOST : Role.USER
                };

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
        this.users.set(this.user.username, this.user);
    }

    onDisconnect() {

    }

    private askUsername(): string {
        while (true) {
            let username = prompt("Please enter a username");
            if (username) {
                if (this.users.get(username)) {
                    alert(`Username "${username}" already taken`);
                }
                else {
                    return username;
                }
            }
        }
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