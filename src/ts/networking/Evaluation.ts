import { RealityBoxCollab } from "../RealityboxCollab";
import { AbstractMultiTool } from "../tools/AbstractMultiTool";
import { Utils } from "../utils/Utils";

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
                if (time - this.lastSend > Evaluation.SEND_INTERVAL && !this.instance.room.isLocal) {
                    this.sendMetrics();
                    this.lastSend = time;
                    this.frames = 0;
                }
            });
            window.onerror = this.reportError.bind(this);
        }
    }

    /**
     * Send metrics to the evaluation backend server
     */
    private sendMetrics() {
        const p = window.performance as any; // Memory not supported by all browsers

        const at = this.instance.toolbar.activeTool;

        let metrics: Metrics = {
            fps: this.frames / (Evaluation.SEND_INTERVAL / 1_000.0), // Average FPS over the send interval
            time: Date.now(),
            activeTool: at?.name,
            subTool: (at instanceof AbstractMultiTool) ? at.activeTool.name : null,
            activeNavigationMode: this.instance.navigationToolbar.activeTool?.name,
            activeViewMode: this.instance.viewModesToolbar.activeTool?.name,
            user: this.collectUserInformation(),
            usedHeapSize: p.memory ? p.memory.usedJSHeapSize : 0,
            heapSize: p.memory ? p.memory.totalJSHeapSize : 0,
            heapLimit: p.memory ? p.memory.jsHeapSizeLimit : 0,
        };
        this.send("/metrics", metrics);
    }

    /**
     * Report an error to the evaluation backend server
     * @param msg The message of the error
     * @param source The source of the error ~> Source file and origin
     * @param line The line of the statement causing the error
     * @param column The column of the error
     * @param error The error as object (unused)
     */
    private reportError(msg: string, source: string, line: number, column: number, error: any) {
        let e: Error = {
            message: msg,
            source: source,
            line: line,
            column: column,
            user: this.collectUserInformation()
        };
        this.send("/error", e);
    }

    private collectUserInformation(): UserInformation {
        return {
            room: this.instance.room.roomInfo.name,
            username: this.instance.room.user?.username, // User could be in the joining process
            screenWidth: screen.width,
            screenHeight: screen.height,
            language: window.navigator.language,
            userAgent: window.navigator.userAgent,
            mobile: Utils.isMobile
        };
    }

    /**
     * Send a POST request to the evaluation backend server. This method will immediately return and will not wait for a response.
     * @param endpoint The endpoint to post to
     * @param object The object to post
     */
    private send(endpoint: string, object: any) {
        let req = new XMLHttpRequest();
        req.open("POST", RealityBoxCollab.EVALUATION_SERVER + endpoint, true); // true for async
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(object));
    }
}

/**
 * The metrics object send to the backend server (has a corresponding Java class)
 */
interface Metrics {
    fps: number;
    time: number;
    activeTool: string;
    subTool: string;
    activeNavigationMode: string;
    activeViewMode: string;
    user: UserInformation;
    usedHeapSize: number;
    heapSize: number;
    heapLimit: number;
}

interface UserInformation {
    username: string;
    room: string;
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
    language: string;
    mobile: boolean;
}

/**
 * The error object send to the backend server in case of an error (has a corresponding Java class)
 */
interface Error {
    message: string;
    source: string;
    line: number;
    column: number;
    user: UserInformation;
}