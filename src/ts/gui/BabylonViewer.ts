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

    // Creating lines for pointer: https://doc.babylonjs.com/divingDeeper/mesh/creation/set

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

const RED = new BABYLON.Color3(1, 0, 0);
const GREEN = new BABYLON.Color3(0, 1, 0);
const BLUE = new BABYLON.Color3(0, 0, 1);

class UserMesh {

    mesh: BABYLON.Mesh;
    static matHost: BABYLON.StandardMaterial;
    static matUser: BABYLON.StandardMaterial;

    constructor(private user: User, scene: BABYLON.Scene) {
        if (!UserMesh.matHost) UserMesh.createMats(scene);

        this.mesh = BABYLON.MeshBuilder.CreateCapsule(user.username, {
            height: 32,
            radius: 8,
            subdivisions: undefined,
            capSubdivisions: undefined,
            tessellation: undefined
        }, scene);
        this.mesh.material = user.role == Role.HOST ? UserMesh.matHost : UserMesh.matUser;

        /*var plane = BABYLON.Mesh.CreatePlane("plane", 2, scene);
        plane.parent = this.mesh;
        plane.position.y = 2;
        var advancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);

        var button1 = Button.CreateSimpleButton("but1", this.user.username);
        button1.width = 1;
        button1.height = 0.4;
        button1.color = "gray";
        button1.fontSize = 50;
        button1.background = "green";
        button1.onPointerUpObservable.add(function () {
            alert("you did it!");
        });
        advancedTexture.addControl(button1);*/
    }

    static createMats(scene: BABYLON.Scene) {
        UserMesh.matHost = new BABYLON.StandardMaterial("matHost", scene);
        UserMesh.matUser = new BABYLON.StandardMaterial("matUser", scene);

        UserMesh.matHost.diffuseColor = BLUE;
        UserMesh.matUser.diffuseColor = RED;
    }

}