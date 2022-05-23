import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { NetworkListener } from "./NetworkListener";
import { User } from "./User";

export class Room {
    doc: Y.Doc;
    user: User;

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
        this.user = new User("User " + Math.round(100 * Math.random()));
        let users: User[] = (this.doc.getMap().get("users") as User[]) || [];
        users.push(this.user);
        this.doc.getMap().set("users", users);
        this.applyUpdate();
        
        for (let l of this.listeners) {
            l.currentRoom = this;
            l.onRoomChanged();
        }
    }

    getOtherUsers(): User[] {
        let users: User[] = (this.doc.getMap().get("users") as User[]) || [];
        return users.filter(user => user !== this.user);
    }

    onDisconnect() {

    }

    applyUpdate() {
        console.log("== Apply Updates ==")
        Y.applyUpdate(this.doc, Y.encodeStateAsUpdate(this.doc));
        console.log(this.doc.getMap().toJSON());
    }
}