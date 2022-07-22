import { RealityBoxCollab } from "../RealityboxCollab";

export class Evaluation {
    constructor(private instance: RealityBoxCollab) {
        this.instance.babylonViewer.scene.registerBeforeRender(() => {

        });

        this.sendMetrics();
    }

    private sendMetrics() {
        let metrics: Metrics = {
            fps: 42
        };
        let req = new XMLHttpRequest();
        req.open("POST", RealityBoxCollab.EVALUATION_SERVER + "/metrics", false); // true for async
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(metrics));
    }
}

interface Metrics {
    fps: number;
}