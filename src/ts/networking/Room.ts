import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import { Chat } from "../gui/Chat";
import { Popups } from "../gui/popup/Popups";
import { RealityBoxCollab } from "../RealityboxCollab";
import { PointerInfo } from "../tools/PointerTool";
import { HostUpdater } from "./HostUpdater";
import { NetworkListener } from "./NetworkListener";
import { RoomInformation, RoomManager } from "./RoomManager";

export class Room {

    /** The provider for the YJS room */
    private wsProvider: WebsocketProvider;
    /** The host updater. Only used if the user of this instance is the room host */
    private hostUpdater: HostUpdater;
    private manager: RoomManager
    /** The general shared document for this room */
    doc: Y.Doc;
    /** The user of this instance */
    user: User;
    /** All users of the current room (including the user of this instance) */
    users: Y.Map<User>;
    connected: boolean = false;

    /**
     * Create a new room
     * @param instance Reference to the RealityBoxCollab instance
     * @param listeners The listeners which will be notified on room change
     * @param roomInfo The room info for the room to create or join
     * @param isCreator Whether this user is the creator of the room
     * @param isLocal Whether this room is a local / pseudo room
     */
    constructor(private instance: RealityBoxCollab, private listeners: NetworkListener[], public roomInfo: RoomInformation, public isCreator: boolean, username: string, public isLocal: boolean) {
        this.doc = new Y.Doc();
        this.manager = this.instance.roomManager;

        if (!isLocal) {
            this.wsProvider = new WebsocketProvider('ws://192.168.0.10:1234', "room:" + roomInfo.name, this.doc);
            this.wsProvider.on('status', (event: any) => {
                if (event.status === "connected" && !this.connected) {
                    this.connected = true;
                    this.onConnect(username);
                }
                else if (event.status === "disconnected") {
                    this.onDisconnect();
                    // Prevents yjs bug, where yjs reconnects randomly to the old room while reloading the page
                    setTimeout(() => this.connected = false, 1000);
                }
            });
        }
        else {
            this.onConnect(undefined);
        }
    }

    /**
     * Called when beeing connected to a room. This method might be called multiples times, e.g. when reconnecting to the local room
     * @param username if set, the username will be used for non local rooms. If not set, the username will be asked (used, if not creator)
     */
    async onConnect(username: string) {
        this.users = this.doc.getMap("userdata");
        this.user = {
            username: this.isLocal ? "Local User" : (username || await this.askUsername()),
            position: null,
            role: this.isCreator ? Role.HOST : Role.USER
        };
        this.onUserUpdated();

        for (let l of this.listeners) {
            l.currentRoom = this;
            l.onRoomChanged();
        }

        this.sendRoomMessage(`User ${this.user.username} joined the room`);

        this.manager.rooms.observe(() => {
            if (this.isLocal) return;

            this.roomInfo = this.manager.getRoom(this.roomInfo.name);
            this.listeners.forEach(l => l.onSettingsChanged());
        });

        if (this.user.role == Role.HOST && !this.isLocal) {
            this.hostUpdater = new HostUpdater(this);
        }
    }

    /**
     * Manually disconnect from the current room
     * @throws Error, if the current room is the local room
     */
    disconnect(): void {
        if (this.isLocal) throw new Error("Cannot disconnect from the local room");

        this.sendRoomMessage(`User ${this.user.username} left the room`);
        this.users.delete(this.user.username);
        this.wsProvider.disconnect();
        this.onDisconnect();
    }

    /**
     * Called when disconnecting from the room
     */
    onDisconnect(): void {
        if (this.hostUpdater) {
            this.hostUpdater.clear();
        }
        this.instance.room = this.instance.localRoom;
        this.instance.room.onConnect(undefined);
    }

    /**
     * Propagate changes to the user object to the other users of the room
     */
    onUserUpdated(): void {
        this.user.lastUpdate = Date.now();
        this.users.set(this.user.username, this.user);
    }

    onSettingsUpdated(): void {
        this.manager.updateRoom(this.roomInfo);
    }

    /**
     * Send a message as this room.
     * @param msg The message to send
     */
    sendRoomMessage(msg: string): void {
        this.instance.chat.sendMessage(Chat.createMessage(msg, "Room " + this.roomInfo.name));
    }

    private async askUsername(): Promise<string> {
        let promise = new Promise<string>((resolve) => {
            let p = Popups.input("Please enter a new username for this room", "New username", (username) => {
                if (!Room.checkUsername(username)) return;

                else if (this.users.get(username)) {
                    Popups.alert(`Username "${username}" already taken`);
                }
                else {
                    p.close();
                    resolve(username);
                }
            });
        });
        return promise;
    }

    /**
     * Check whether a username is allowed to be used. This method will open a alert popup, if the username is not allowed
     * @param username The username to check
     * @returns true, if the username is allowed
     */
    static checkUsername(username: string): boolean {
        let r = null;
        if (!username || username.length < 3) {
            r = "Your username needs to be at least 3 characters long";
        }

        if (r) Popups.alert(r);
        return r == null;
    }
}

/**
 * Represents a user of a room
 */
export interface User {
    /** The username of the user. This name is unique to this room */
    username: string;
    /** The role of the user for this room */
    role: Role;
    /** The position of the user in the scene */
    position: BABYLON.Vector3;
    /** The last update of the user. This time is used for timeout timeouts*/
    lastUpdate?: number;
    /** Set when the user is using the pointer tool */
    pointer?: PointerInfo;
}

export enum Role {
    HOST, CO_HOST, USER
}