import { Engine, Mesh, Scene } from "babylonjs";

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
    scene: Scene;
    engine: Engine;
    camera: any;
    model: RealityboxModel;
}

export interface RealityboxModel {
   env: Mesh;
}

export interface RealityboxAnnotation {
   
}