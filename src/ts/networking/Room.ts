import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export class Room {
    doc: Y.Doc;

    constructor() {
        this.doc = new Y.Doc();
        const wsProvider = new WebsocketProvider('ws://localhost:1234', 'room', this.doc);
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
        this.doc.getMap().set(Math.random() + "", "a");
        Y.applyUpdate(this.doc, Y.encodeStateAsUpdate(this.doc));
        console.log(this.doc.getMap().toJSON());
    }

    onDisconnect() {

    }
}