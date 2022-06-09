import * as Y from "yjs";
import { NetworkListener } from "../networking/NetworkListener";
import { Role, User } from "../networking/Room";
import { RealityBoxCollab } from "../RealityboxCollab";
import { createVector } from "../tools/PointerTool";
import { Toolbar } from "./Toolbar";
import { XrGui } from "./XrGui";
import * as BABYLON from "@babylonjs/core/Legacy/legacy";

/**
 * This class represents all important logic which has to do with the babylon scene, which is not in its own tool
 */
export class BabylonViewer extends NetworkListener {
    scene: BABYLON.Scene;
    userMeshes: Map<string, UserMesh> = new Map();
    models: BABYLON.Mesh[];
    remoteModelInfo: Y.Map<ModelInformation>;
    localModelInfo: Map<string, ModelInformation> = new Map();
    isInXR: boolean = false;
    xrGui: XrGui;

    constructor(toolbar: Toolbar) {
        super();

        this.models = [RealityBoxCollab.instance.realitybox.viewer._babylonBox.model.env];
        this.scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;

        this.xrGui = new XrGui(toolbar, this.scene);

        this.scene.registerBeforeRender(() => {
            this.onRender();
        });
    }

    onXRStateChanged(newState: boolean): void {
        this.isInXR = newState;
        this.xrGui.onXRStateChanged(newState);
    }

    /**
     * Called on every frame before rendering
     */
    private onRender(): void {
        this.currentRoom.user.position = this.scene.activeCamera.position;
        this.currentRoom.onUserUpdated();

        this.currentRoom.users
            .forEach((user: User) => {
                if (user.username === this.currentRoom.user.username) return;

                let mesh: UserMesh = this.userMeshes.get(user.username);
                if (!mesh) this.userMeshes.set(user.username, mesh = new UserMesh(user, this.scene));

                if (!user.position) return; // If position is set, than all are set

                mesh.mesh.position = user.position;
            });

        if (this.userMeshes.size > this.currentRoom.users.size - 1) {
            this.userMeshes.forEach(mesh => {
                if (!this.currentRoom.users.get(mesh.user.username)) {
                    this.userMeshes.delete(mesh.user.username);
                    this.scene.removeMesh(mesh.mesh);
                }
            });
        }

        this.models.forEach(mesh => {
            let remote = this.remoteModelInfo.get(mesh.name);
            let local = this.localModelInfo.get(mesh.name);
            let now = getInformation(mesh);
            if (!local) this.localModelInfo.set(mesh.name, local = now);
            if (!remote) this.remoteModelInfo.set(mesh.name, remote = now);

            if (!informationEquals(remote, local)) { // Remote changes
                applyInformation(mesh, remote);
            }
            else if (!informationEquals(local, now)) { // Local changes
                this.remoteModelInfo.set(mesh.name, now);
            }

            this.localModelInfo.set(mesh.name, now);
        });
    }

    onRoomChanged(): void {
        this.userMeshes.forEach(mesh => {
            this.scene.removeMesh(mesh.mesh);
        });
        this.userMeshes.clear();
        this.remoteModelInfo = this.currentRoom.doc.getMap("models");
    }

}

const RED = new BABYLON.Color3(1, 0, 0);
const GREEN = new BABYLON.Color3(0, 1, 0);
const BLUE = new BABYLON.Color3(0, 0, 1);

class UserMesh {

    mesh: BABYLON.Mesh;
    static matHost: BABYLON.StandardMaterial;
    static matUser: BABYLON.StandardMaterial;

    constructor(public user: User, scene: BABYLON.Scene) {
        if (!UserMesh.matHost) UserMesh.createMats(scene);

        this.mesh = BABYLON.MeshBuilder.CreateCapsule(user.username, {
            height: 32,
            radius: 8,
            subdivisions: undefined,
            capSubdivisions: undefined,
            tessellation: undefined
        }, scene);
        this.mesh.material = user.role == Role.HOST ? UserMesh.matHost : UserMesh.matUser;
    }

    static createMats(scene: BABYLON.Scene) {
        UserMesh.matHost = new BABYLON.StandardMaterial("matHost", scene);
        UserMesh.matUser = new BABYLON.StandardMaterial("matUser", scene);

        UserMesh.matHost.diffuseColor = BLUE;
        UserMesh.matUser.diffuseColor = RED;
    }

}

export interface ModelInformation {
    position: BABYLON.Vector3;
    rotation: BABYLON.Quaternion;
    scale: BABYLON.Vector3;
}

function applyInformation(mesh: BABYLON.Mesh, info: ModelInformation): void {
    mesh.position = createVector(info.position);
    mesh.rotationQuaternion = createQuaternion(info.rotation);
    mesh.scaling = createVector(info.scale);
}

function getInformation(mesh: BABYLON.Mesh): ModelInformation {
    return {
        position: mesh.position.clone(),
        rotation: mesh.rotationQuaternion.clone(),
        scale: mesh.scaling.clone()
    };
}

function informationEquals(a: ModelInformation, b: ModelInformation): boolean {
    return vecEquals(a.position, b.position) && quatEquals(a.rotation, b.rotation) && vecEquals(a.scale, b.scale);
}

function vecEquals(a: BABYLON.Vector3, b: BABYLON.Vector3): boolean {
    return a._x == b._x && a._y == b._y && a._z == b._z;
}

function createQuaternion(q: BABYLON.Quaternion): BABYLON.Quaternion {
    return new BABYLON.Quaternion(q._x, q._y, q._z, q._w);
}

function quatEquals(a: BABYLON.Quaternion, b: BABYLON.Quaternion) {
    return a._x == b._x && a._y == b._y && a._z == b._z && a._w == b._w;
}

