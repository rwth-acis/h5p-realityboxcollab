import * as BABYLON from "@babylonjs/core/Legacy/legacy";
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

    /** Reference to the current babylonjs scene */
    scene: BABYLON.Scene;
    /** Reference to Realitybox's babylonbox instance */
    babylonBox: BabylonBox;
    /** User meshes currently in the scene */
    userMeshes: Map<string, UserMesh> = new Map();
    /** The 3D models in the scene. Currently only one can be added due to Realitybox. */
    models: BABYLON.Mesh[];
    /** The base nodes for the 3D models. Just as 'models', only one is used at the moment. */
    modelNodes: BABYLON.TransformNode[] = [];
    /** The current XR State of the application */
    xrState: XRState = XRState.NONE;
    /** The XR GUIS */
    xrGui: XrGui[] = [];
    /** The base node, all meshes are parented to. This node allows simple manipulation of all meshes in the scene. */
    baseNode: BABYLON.TransformNode;

    /**
     * Create the instance of the BabylonViewer
     * @param instance The main instance of RealityboxCollab
     */
    constructor(private instance: RealityBoxCollab) {
        super();

        // Get fields
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

    /**
     * Register a toolbar to be used in XR
     * @param toolbar The toolbar a XR Gui should be created for
     */
    registerToolbar(toolbar: Toolbar) {
        this.xrGui.push(new XrGui(toolbar, this.scene, this.instance));
    }

    /**
     * Checks whether the application is currently in XR
     * @returns true, if currently in XR (that is in VR or AR)
     */
    isInXR(): boolean {
        return this.xrState != XRState.NONE;
    }

    /**
     * Called by AbstractXRView when the XR state changes
     * @param newState The new state
     * @param ex The XR experience (will be used of the XR GUI)
     */
    onXRStateChanged(newState: XRState, ex: BABYLON.WebXRDefaultExperience): void {
        this.xrState = newState;
        this.xrGui.forEach(g => g.onXRStateChanged(newState, ex));
    }

    private adjustModelScale() {
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

    /**
     * Called on every frame before rendering. Handles the updates for the user meshes.
     */
    private onRender(): void {
        // Annotations sometimes change
        for (let a of this.instance.realitybox.viewer._babylonBox.getAnnotations()) {
            a.drawing.parent = this.baseNode;
        }

        this.currentRoom.user.position = Utils.getRelativePosition(this, this.scene.activeCamera.position);
        this.currentRoom.onUserUpdated();

        this.currentRoom.users
            .forEach((user: User) => {
                if (user.username === this.currentRoom.user.username) return;

                let mesh: UserMesh = this.userMeshes.get(user.username);
                if (!mesh) this.userMeshes.set(user.username, mesh = new UserMesh(user, this.scene, this.baseNode));

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
    }

    /**
     * When the room changes, all userMeshes are removed. The new meshes will be created automatically in the update loop.
     */
    onRoomChanged(): void {
        this.userMeshes.forEach(mesh => {
            this.scene.removeMesh(mesh.mesh);
        });
        this.userMeshes.clear();
    }

    /**
     * Listens for setting changes to check whether annotations are currently enabled
     */
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

/**
 * Represents the 3D model of a user
 */
class UserMesh {

    mesh: BABYLON.Mesh;
    static matHost: BABYLON.StandardMaterial;
    static matUser: BABYLON.StandardMaterial;

    constructor(public user: User, scene: BABYLON.Scene, baseNode: BABYLON.Node) {
        if (!UserMesh.matHost) UserMesh.createMats(scene);

        this.mesh = BABYLON.MeshBuilder.CreateCapsule(user.username, {
            height: 0.2,
            radius: 0.05,
            subdivisions: undefined,
            capSubdivisions: undefined,
            tessellation: undefined
        }, scene);
        this.mesh.parent = baseNode;
        this.mesh.material = user.role == Role.HOST ? UserMesh.matHost : UserMesh.matUser;
    }

    /**
     * Only called once to create the materials used for the user geometry
     * @param scene The scene of the application
     */
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