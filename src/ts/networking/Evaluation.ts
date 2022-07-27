import { RealityBoxCollab } from "../RealityboxCollab";

/**
 * This class handles sending metrics and potential error to the evaluation backend, if {@link RealityBoxCollab.EVALUATION_MODE} is enabled.
 */
export class Evaluation {
    static readonly SEND_INTERVAL = 10_000; // in ms
    lastSend: number = 0;
    frames: number = 0;

    constructor(private instance: RealityBoxCollab) {
        if (RealityBoxCollab.EVALUATION_MODE) {
            this.instance.babylonViewer.scene.registerBeforeRender(() => {
                this.frames++;
                let time = Date.now();
                if (time - this.lastSend > Evaluation.SEND_INTERVAL) {
                    this.sendMetrics();
                    this.lastSend = time;
                    this.frames = 0;
                }
            });
            window.onerror = this.reportError.bind(this);
        }
    }

    private sendMetrics() {
        let metrics: Metrics = {
            fps: this.frames / (Evaluation.SEND_INTERVAL / 1_000.0), // Average FPS over the send interval
            time: Date.now(),
            activeTool: this.instance.toolbar.activeTool?.name,
            activeNavigationMode: this.instance.viewToolbar.activeTool?.name,
            activeViewMode: this.instance.viewModesToolbar.activeTool?.name,
            room: this.instance.room.roomInfo.name,
            username: this.instance.room.user?.username // User could be in the joining process
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
        req.open("POST", RealityBoxCollab.EVALUATION_SERVER + endpoint, true); // true for async
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(object));
    }
}

interface Metrics {
    fps: number;
    time: number;
    activeTool: string;
    activeNavigationMode: string;
    activeViewMode: string;
    username: string;
    room: string;
}

interface Error {
    message: string;
    source: string;
    line: number;
    column: number;
    error: any;
}