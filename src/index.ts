import * as $ from 'jquery'; // Needed for JQuery to be loaded
import './css/material-icons/material-icons.css';
import './css/realitybox.css';
import './css/realitybox-collab.scss';
import { Settings } from './ts/gui/Settings';
import { Chat } from './ts/gui/Chat';
import { Toolbar } from './ts/gui/Toolbar';
import { Room } from './ts/networking/Room';
import { AbstractGuiElement } from './ts/gui/AbstractGuiElement';

declare let H5P: any;
H5P = H5P || {};

H5P.RealityBoxCollab = class extends H5P.ContentType(true) {

  realitybox: any;
  options: any;
  room: Room;
  elements: AbstractGuiElement[];

  constructor(options: any, private id: any) {
    super();
    this.options = options.realityboxcollab;
  }

  async attach($container: JQuery) {
    this.realitybox = H5P.newRunnable({
      library: 'H5P.RealityBox 1.0',
      params: { realitybox: this.options },
      metadata: undefined
    }, this.id, undefined, undefined, { parent: this });

    await this.realitybox.attach($container);

    this.realitybox._viewer = new Proxy(this.realitybox._viewer, {
      set: this.onPropertySet.bind(this)
    });

  }

  onPropertySet(target: any, key: string, value: any) {
    if (key === "$el") {
      this.elements = [new Toolbar(value), new Chat(value), new Settings(value)];
      this.elements.forEach(e => e.init());
      this.debug();
    }
    target[key] = value;
    return true;
  }

  debug() {
    this.room = new Room(this.elements);
  }
}
