export interface Realitybox {
    _viewer: any; // Proxy
    viewer: RealityBoxViewer;
    attach($container: JQuery): void;
}

export interface RealityBoxViewer {
    _$canvas: JQuery;
    $container: JQuery;
    _babylonBox: BabylonBox;
    activeAnnotation: any;
}

export interface BabylonBox {
    webXRSupported: boolean;
    scene: BABYLON.Scene;
    engine: BABYLON.Engine;
    camera: BABYLON.Camera;
    model: RealityboxModel;
}

export interface RealityboxModel {
   env: BABYLON.Mesh;
}

export interface RealityboxAnnotation {
   
}