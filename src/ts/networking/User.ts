import { Vector3 } from "babylonjs";

export class User {
    position: Vector3;
    role: Role = Role.USER;
}

export enum Role {
    HOST, USER
}