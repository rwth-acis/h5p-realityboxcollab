//import { HemisphericLight, Vector3, Vector4 } from 'babylonjs';

import Toolbar from "./gui/toolbar";
import Chat from "./gui/chat";
import Settings from "./gui/settings";

H5P.RealityBoxCollab = (function ($) {

  function RealityBoxCollab(options, id) {
    this.options = options.realityboxcollab;
  }

  RealityBoxCollab.prototype.attach = async function ($container) {
    this.realitybox = H5P.newRunnable({
      library: 'H5P.RealityBox 1.0',
      params: {realitybox: this.options}
    }, this.id, undefined, undefined, { parent: this });

    await this.realitybox.attach($container);

    this.realitybox._viewer = new Proxy(this.realitybox._viewer, {
      set: function (target, key, value) {
          if (key === "$el") {
            this._toolbar = new Toolbar(value);
            this._chat = new Chat(value);
            this._settings = new Settings(value);
          }
          target[key] = value;
          return true;
      }
    });
   
  }

  return RealityBoxCollab;

})(H5P.jQuery);

export default H5P.RealityBoxCollab;
