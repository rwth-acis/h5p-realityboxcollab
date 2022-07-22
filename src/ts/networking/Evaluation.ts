import { RealityBoxCollab } from "../RealityboxCollab";

export class Evaluation {
    constructor(private instance: RealityBoxCollab) {
        this.instance.babylonViewer.scene.registerBeforeRender(() => {

        });
        window.onerror = this.reportError.bind(this);

        this.sendMetrics();
    }

    private sendMetrics() {
        let metrics: Metrics = {
            fps: 42
        };
        this.send("/metrics", metrics);
    }

    private reportError(msg: string, source: string, line: number, column: number, error: any) {
        let e: Error = {
            message: msg,
            source: source,
            line: line,
            column: column,
            error: error
        };
        this.send("/error", e);
    }

    private send(endpoint: string, object: any) {
        let req = new XMLHttpRequest();
        req.open("POST", RealityBoxCollab.EVALUATION_SERVER + endpoint, false); // true for async
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(object));
    }
}

interface Metrics {
    fps: number;
}

interface Error {
    message: string;
    source: string;
    line: number;
    column: number;
    error: any;
}