import * as BABYLON from "@babylonjs/core/Legacy/legacy";

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
    camera: any;
    model: RealityboxModel;
    $canvas: JQuery;
    _annotationsManager: RealityboxAnnotationManager;
    addAnnotation(options: RealityboxAnnotation): RealityboxAnnotation;
    removeAnnotation(a: RealityboxAnnotation): void;
    getAnnotations(): RealityboxAnnotation[];
    getIndexOfAnnotation(a: RealityboxAnnotation): number;
    setAnnotationState(state: string, a: RealityboxAnnotation): void;
    showAllAnnotations(): void;
    hideAllAnnotations(): void;
}

export interface RealityboxModel {
    env: BABYLON.Mesh;
}

export interface RealityboxAnnotationManager {
    annotations: RealityboxAnnotation[];
}

export interface RealityboxAnnotation {
    position: BABYLON.Vector3;
    normalRef: BABYLON.Vector3;
    content: H5PContent;
}

export interface H5PContent {
    library: string;
    params: any;
}