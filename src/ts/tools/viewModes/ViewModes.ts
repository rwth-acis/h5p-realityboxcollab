import { BabylonViewer } from "../../gui/BabylonViewer";
import { AbstractTool } from "../AbstractTool";
import { DrawTool } from "../DrawTool";

export class NormalViewMode extends AbstractTool {

    constructor(private babylonView: BabylonViewer) {
        super("Normal", "fa-solid fa-earth-americas");
    }

    onActivate(): void {}
    onDeactivate(): void {}
    onRoomChanged(): void {}

}

export class PaintViewMode extends AbstractTool {

    constructor(private babylonView: BabylonViewer, private drawTool: DrawTool) {
        super("Paint", "fa-solid fa-paintbrush");
    }

    onActivate(): void {}
    onDeactivate(): void {}
    onRoomChanged(): void {}

}

export class WireframeViewMode extends AbstractTool {

    constructor(private babylonView: BabylonViewer) {
        super("Wireframe", "fa-solid fa-border-none");
    }

    onActivate(): void {}
    onDeactivate(): void {}
    onRoomChanged(): void {}

}