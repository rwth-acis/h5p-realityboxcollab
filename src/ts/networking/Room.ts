import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { NetworkListener } from "./NetworkListener";
import { RoomInformation } from "./RoomManager";
import { RealityBoxCollab } from "../RealityboxCollab";
import { Chat } from "../gui/Chat";

export class Room {

    doc: Y.Doc;
    user: User;
    users: Y.Map<User>;
    wsProvider: WebsocketProvider;
    creator: boolean;

    constructor(private listeners: NetworkListener[], public roomInfo: RoomInformation, create: boolean) {
        this.doc = new Y.Doc();
        this.creator = create;
        this.wsProvider = new WebsocketProvider('ws://localhost:1234', "room:" + roomInfo.name, this.doc);
        this.wsProvider.on('status', (event: any) => {
            if (event.status === "connected") {
                this.onConnect();
            }
            else if (event.status === "disconnected") {
                this.onDisconnect();
            }
        });
    }

    onConnect(): void {
        this.users = this.doc.getMap("userdata");
        let username: string = this.askUsername();
        this.user = {
            username: username,
            position: null,
            role: this.creator ? Role.HOST : Role.USER
        };

        this.onUserUpdated();

        for (let l of this.listeners) {
            l.currentRoom = this;
            l.onRoomChanged();
        }

        this.sendRoomMessage(`User ${this.user.username} joined the room`);
    }

    onUserUpdated(): void {
        this.users.set(this.user.username, this.user);
    }

    disconnect(): void {
        this.sendRoomMessage(`User ${this.user.username} left the room`);
        this.users.delete(this.user.username);
        this.wsProvider.disconnect();
        this.onDisconnect();
    }

    onDisconnect(): void {
        for (let l of this.listeners) {
            l.currentRoom = null;
            l.onRoomChanged();
        }
    }

    /**
     * Send a message as this room.
     * @param msg The message to send
     */
    sendRoomMessage(msg: string): void {
        RealityBoxCollab.instance.chat.sendMessage(Chat.createMessage(msg, "Room " + this.roomInfo.name));
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