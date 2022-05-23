import * as $ from 'jquery'; // Needed for JQuery to be loaded
import { Settings } from './gui/Settings';
import { Chat } from './gui/Chat';
import { Toolbar } from './gui/Toolbar';
import { Room } from './networking/Room';
import { AbstractGuiElement } from './gui/AbstractGuiElement';
import { Realitybox } from './RealityboxTypes';


declare let H5P: any;
H5P = H5P || {};

export class RealityBoxCollab {
    static instance: RealityBoxCollab;

    realitybox: Realitybox;
    options: any;
    elements: AbstractGuiElement[];
    room: Room;

    constructor(options: any, private id: any) {
        this.options = options.realityboxcollab;
        if (RealityBoxCollab.instance) {
            throw new Error("Instance already definied");
        }
        RealityBoxCollab.instance = this;
    }

    async attach($container: JQuery) {
        this.realitybox = H5P.newRunnable({
            library: 'H5P.RealityBox 1.0',
            params: { realitybox: this.options },
            metadata: undefined
        }, this.id, undefined, undefined, { parent: this });

        await this.realitybox.attach($container);

        this.realitybox.viewer = this.realitybox._viewer;
        this.realitybox._viewer = new Proxy(this.realitybox._viewer, {
            set: this.onPropertySet.bind(this)
        });
    }

    onPropertySet(target: any, key: string, value: any) {
        if (key === "$el") {
            this.elements = [new Toolbar(value), new Chat(value), new Settings(value)];
            this.elements.forEach(e => e.init());
        }
        target[key] = value;
        return true;
    }
}