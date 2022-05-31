import { NetworkListener } from "../networking/NetworkListener";
import { Role, User } from "../networking/Room";
import { RealityBoxCollab } from "../RealityboxCollab";

/**
 * This class represents all important logic which has to do with the babylon scene, which is not in its own tool
 */
export class BabylonViewer extends NetworkListener {
    scene: BABYLON.Scene;
    meshes: Map<string, UserMesh> = new Map();

    constructor() {
        super();

        this.scene = RealityBoxCollab.instance.realitybox.viewer._babylonBox.scene;
        this.scene.registerBeforeRender(() => {
            this.onRender();
        });
    }

    /**
     * Called on every frame before rendering
     */
    private onRender(): void {
        if (!this.currentRoom) return;

        this.currentRoom.user.position = this.scene.activeCamera.position;
        this.currentRoom.onUserUpdated();

        this.currentRoom.users
            .forEach(user => {
                if (user.username === this.currentRoom.user.username) return;

                let mesh: UserMesh = this.meshes.get(user.username);
                if (!mesh) this.meshes.set(user.username, mesh = new UserMesh(user, this.scene));

                if (!user.position) return; // If position is set, than all are set

                mesh.mesh.position = user.position;
            });

        if (this.meshes.size > this.currentRoom.users.size - 1) {
            this.meshes.forEach(mesh => {
                if (!this.currentRoom.users.get(mesh.user.username)) {
                    this.meshes.delete(mesh.user.username);
                    this.scene.removeMesh(mesh.mesh);
                }
            });
        }
    }

    onRoomChanged(): void {
        this.meshes.forEach(mesh => {
            this.scene.removeMesh(mesh.mesh);
        });
        this.meshes.clear();
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