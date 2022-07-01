import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import * as Y from "yjs";
import { NetworkListener } from "../networking/NetworkListener";
import { Role, User } from "../networking/Room";
import { RealityBoxCollab } from "../RealityboxCollab";
import { BabylonBox } from "../RealityboxTypes";
import { Utils } from "../utils/Utils";
import { Toolbar } from "./Toolbar";
import { XrGui } from "./XrGui";

/**
 * This class represents all important logic which has to do with the babylon scene, which is not in its own tool
 */
export class BabylonViewer extends NetworkListener {
    static readonly WORLD_SIZE = 1;

    scene: BABYLON.Scene;
    babylonBox: BabylonBox;
    userMeshes: Map<string, UserMesh> = new Map();
    models: BABYLON.Mesh[];
    modelNodes: BABYLON.TransformNode[] = [];
    remoteModelInfo: Y.Map<ModelInformation>;
    localModelInfo: Map<string, ModelInformation> = new Map();
    xrState: XRState = XRState.NONE;
    xrGui: XrGui[] = [];
    baseNode: BABYLON.TransformNode;

    constructor(private instance: RealityBoxCollab) {
        super();

        this.models = [instance.realitybox.viewer._babylonBox.model.env];
        this.scene = instance.realitybox.viewer._babylonBox.scene;
        this.babylonBox = instance.realitybox.viewer._babylonBox;
        this.baseNode = new BABYLON.TransformNode("Base Node", this.scene);


        for (let model of this.models) {
            let node = new BABYLON.TransformNode("Parent Node for " + model.name, this.scene);
            node.parent = this.baseNode;
            this.modelNodes.push(node);
            model.setParent(node);
        }
        this.adjustModelScale();

        this.scene.registerBeforeRender(() => {
            this.onRender();
        });
    }

    registerToolbar(toolbar: Toolbar) {
        this.xrGui.push(new XrGui(toolbar, this.scene, this.instance));
    }

    isInXR(): boolean {
        return this.xrState != XRState.NONE;
    }

    adjustModelScale() {
        for (let m of this.models) {
            let max = new BABYLON.Vector3(0, 0, 0);
            let min = new BABYLON.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
            for (let c of m.getChildMeshes()) {
                max = Utils.vectorMax(max, c.getBoundingInfo().boundingBox.maximumWorld);
                min = Utils.vectorMin(min, c.getBoundingInfo().boundingBox.minimumWorld);
            }
            // Scale to 1m in height 
            m.scaling.scaleInPlace(BabylonViewer.WORLD_SIZE / max.subtract(min).y);
        }

        const cam = this.instance.realitybox.viewer._babylonBox.camera.babylonObj;
        cam.lowerRadiusLimit = 0.05 * BabylonViewer.WORLD_SIZE;
        cam.upperRadiusLimit = 30 * BabylonViewer.WORLD_SIZE;
        cam.speed = 0.2 * BabylonViewer.WORLD_SIZE; 
        cam.minZ = 0; // Near clipping plane
        cam.radius = 2 * BabylonViewer.WORLD_SIZE;
        cam.wheelPrecision = 50 * BabylonViewer.WORLD_SIZE;
    }

    onXRStateChanged(newState: XRState, ex:  BABYLON.WebXRDefaultExperience): void {
        this.xrState = newState;
        this.xrGui.forEach(g => g.onXRStateChanged(newState, ex));
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

    override onSettingsChanged(): void {
        if (this.currentRoom.roomInfo.settings.annotationEnabled) this.babylonBox.showAllAnnotations();
        else this.babylonBox.hideAllAnnotations();
    }

}

export enum XRState {
    AR, VR, NONE
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
            height: 0.2,
            radius: 0.05,
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
    mesh.position = Utils.createVector(info.position);
    mesh.rotationQuaternion = Utils.createQuaternion(info.rotation);
    mesh.scaling = Utils.createVector(info.scale);
}

function getInformation(mesh: BABYLON.Mesh): ModelInformation {
    return {
        position: mesh.position.clone(),
        rotation: mesh.rotationQuaternion.clone(),
        scale: mesh.scaling.clone()
    };
}

function informationEquals(a: ModelInformation, b: ModelInformation): boolean {
    return Utils.vectorEquals(a.position, b.position) && Utils.quaternionEquals(a.rotation, b.rotation) && Utils.vectorEquals(a.scale, b.scale);
}
