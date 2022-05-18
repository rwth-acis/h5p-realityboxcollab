import * as $ from 'jquery';
import './css/material-icons/material-icons.css';
import './css/realitybox.css';
import './css/realitybox-collab.css';
import { Settings } from './ts/gui/Settings';
import { Chat } from './ts/gui/Chat';
import { Toolbar } from './ts/gui/Toolbar';

declare let H5P: any;
H5P = H5P || {};

H5P.RealityBoxCollab = class extends H5P.ContentType(true) {

  realitybox: any;
  options: any;
  toolbar: Toolbar;
  setttings: Settings;
  chat: Chat;
  
  constructor(options: any, private id: any) {
    super();
    this.options = options.realityboxcollab;
  }

  attach = async function($container: JQuery) {
    console.log("XXX");
    this.realitybox = H5P.newRunnable({
      library: 'H5P.RealityBox 1.0',
      params: { realitybox: this.options },
      metadata: undefined
    }, this.id, undefined, undefined, { parent: this });

    await this.realitybox.attach($container);

    this.realitybox._viewer = new Proxy(this.realitybox._viewer, {
      set: function (target, key, value) {
        if (key === "$el") {
          this.toolbar = new Toolbar(value);
          this.chat = new Chat(value);
          this.settings = new Settings(value);
        }
        target[key] = value;
        return true;
      }
    });
  }
}
