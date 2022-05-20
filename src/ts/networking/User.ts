import { Vector3 } from "babylonjs";
import { ChatMessage } from "../gui/Chat";

export class User {
    position: Vector3;
    role: Role = Role.HOST;
    messages: ChatMessage[] = [];

    constructor(public username: string) { }
}

export enum Role {
    HOST, USER
}