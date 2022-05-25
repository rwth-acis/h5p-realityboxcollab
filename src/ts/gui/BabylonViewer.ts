import { NetworkListener } from "../networking/NetworkListener";
import { Role, User } from "../networking/Room";
import { RealityBoxCollab } from "../RealityboxCollab";

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

    onRender() {
        if (!this.currentRoom) return;

        this.currentRoom.user.position = this.scene.activeCamera.position;
        this.currentRoom.onUserUpdated();

        this.currentRoom.usernames.toArray()
            .filter(name => name != this.currentRoom.user.username)
            .forEach(name => {
                let user: User = this.currentRoom.userData.get(name);
                let mesh: UserMesh = this.meshes.get(user.username);
                if (!mesh) this.meshes.set(user.username, mesh = new UserMesh(user, this.scene));

                if (!user.position) return; // If position is set, than all are set

                mesh.mesh.position = user.position;
            });
    }

    onRoomChanged(): void {

    }

}

const RED = new BABYLON.Color4(1, 0, 0, 1);
const GREEN = new BABYLON.Color4(0, 1, 0, 1);
const BLUE = new BABYLON.Color4(0, 0, 1, 1);

class UserMesh {

    mesh: BABYLON.Mesh;

    constructor(private user: User, scene: BABYLON.Scene) {
        this.mesh = BABYLON.MeshBuilder.CreateBox("test-box", {
            size: 20,
            faceColors: user.role == Role.HOST ? [RED, RED, RED, RED, RED, RED] : [BLUE, BLUE, BLUE, BLUE, BLUE, BLUE]
        }, scene);
        this.mesh.material = new BABYLON.StandardMaterial("mat", scene);
    }
}