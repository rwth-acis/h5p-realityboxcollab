//import { HemisphericLight, Vector3, Vector4 } from 'babylonjs';

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

    // Tests
    const box = BABYLON.MeshBuilder.CreateBox("test-box", {
      size: 20
    }, this.realitybox._viewer._babylonBox.scene);
    box.material = new BABYLON.StandardMaterial("mat");
  }

  return RealityBoxCollab;

})(H5P.jQuery);

export default H5P.RealityBoxCollab;
