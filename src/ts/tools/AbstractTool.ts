import { Toolbar } from "../gui/Toolbar";
import { NetworkListener } from "../networking/NetworkListener";

export abstract class AbstractTool extends NetworkListener {

    active: boolean;
    toolbar: Toolbar;

    constructor(public name: string, public icon: string) {
        super();
    }

    abstract onActivate(): void
    abstract onDeactivate(): void;
    canActivate(): boolean {return true;};

    init(toolbar: Toolbar): void {
        this.toolbar = toolbar;
    }
}