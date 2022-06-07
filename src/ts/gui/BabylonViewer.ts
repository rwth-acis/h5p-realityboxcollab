import { Color3, Engine, Mesh, MeshBuilder, Quaternion, Scene, StandardMaterial, Vector3 } from "babylonjs";
import { Map as YMap } from "yjs";
import { NetworkListener } from "../networking/NetworkListener";
import { Role, User } from "../networking/Room";
import { RealityBoxCollab } from "../RealityboxCollab";
import { createVector } from "../tools/PointerTool";

/**
 * This class represents all important logic which has to do with the babylon scene, which is not in its own tool
 */
export class BabylonViewer extends NetworkListener {
    scene: Scene;
    userMeshes: Map<string, UserMesh> = new Map();
    models: Mesh[];
    remoteModelInfo: YMap<ModelInformation>;
    localModelInfo: Map<string, ModelInformation> = new Map();

    constructor() {
        super();

        // Get parameters from Realitybox, Replace Scene because of library problem
        //RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene = new Scene(RealityBoxCollab.instance.realitybox.viewer._babylonBox.engine);
        this.models = [RealityBoxCollab.instance.realitybox.viewer._babylonBox.model.env];
        this.scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;

        //this.scene.createDefaultCameraOrLight(true, true, true);
        //this.scene.createDefaultEnvironment();
        //this.models.forEach(m => this.scene.addMesh(m));

        this.scene.registerBeforeRender(() => {
            this.onRender();
        });
    }

    /**
     * Called on every frame before rendering
     */
    private onRender(): void {
        this.currentRoom.user.position = this.scene.activeCamera.position;
        this.currentRoom.onUserUpdated();

        this.currentRoom.users
            .forEach(user => {
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

const RED = new Color3(1, 0, 0);
const GREEN = new Color3(0, 1, 0);
const BLUE = new Color3(0, 0, 1);

class UserMesh {

    mesh: Mesh;
    static matHost: StandardMaterial;
    static matUser: StandardMaterial;

    constructor(public user: User, scene: Scene) {
        if (!UserMesh.matHost) UserMesh.createMats(scene);

        this.mesh = MeshBuilder.CreateCapsule(user.username, {
            height: 32,
            radius: 8,
            subdivisions: undefined,
            capSubdivisions: undefined,
            tessellation: undefined
        }, scene);
        this.mesh.material = user.role == Role.HOST ? UserMesh.matHost : UserMesh.matUser;
    }

    static createMats(scene: Scene) {
        UserMesh.matHost = new StandardMaterial("matHost", scene);
        UserMesh.matUser = new StandardMaterial("matUser", scene);

        UserMesh.matHost.diffuseColor = BLUE;
        UserMesh.matUser.diffuseColor = RED;
    }

}

export interface ModelInformation {
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
}

function applyInformation(mesh: Mesh, info: ModelInformation): void {
    mesh.position = createVector(info.position);
    mesh.rotationQuaternion = createQuaternion(info.rotation);
    mesh.scaling = createVector(info.scale);
}

function getInformation(mesh: Mesh): ModelInformation {
    return {
        position: mesh.position.clone(),
        rotation: mesh.rotationQuaternion.clone(),
        scale: mesh.scaling.clone()
    };
}

function informationEquals(a: ModelInformation, b: ModelInformation): boolean {
    return vecEquals(a.position, b.position) && quatEquals(a.rotation, b.rotation) && vecEquals(a.scale, b.scale);
}

function vecEquals(a: Vector3, b: Vector3): boolean {
    return a._x == b._x && a._y == b._y && a._z == b._z;
}

function createQuaternion(q: Quaternion): Quaternion {
    return new Quaternion(q._x, q._y, q._z, q._w);
}

function quatEquals(a: Quaternion, b: Quaternion) {
    return a._x == b._x && a._y == b._y && a._z == b._z && a._w == b._w;
}

