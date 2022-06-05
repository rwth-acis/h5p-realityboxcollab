import { NetworkListener } from "../networking/NetworkListener";

export abstract class AbstractTool extends NetworkListener {

    active: boolean;

    constructor(public name: string, public icon: string) {
        super();
    }

    abstract onActivate(): void
    abstract onDeactivate(): void;
    canActivate(): boolean {return true;};
}