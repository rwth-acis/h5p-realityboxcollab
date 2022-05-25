import { NetworkListener } from "../networking/NetworkListener";
import { RealityBoxCollab } from "../RealityboxCollab";

export class BabylonViewer extends NetworkListener {
    scene: BABYLON.Scene;

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
        console.log(this.currentRoom.users.get(0).position);
        this.currentRoom.applyUpdate();

        this.currentRoom.users.toArray()
            .filter(u => u != this.currentRoom.user)
            .forEach(user => {
                //console.log(user.position);
            });
    }

    onRoomChanged(): void {

    }

}